import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { eventsApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import { useToast } from "../hooks/useToast";
import type { CampusEvent, Department } from "../types";

export default function SetAccessCodeModal({
  isOpen,
  onClose,
  event,
  departments,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  departments: Department[];
  onSaved?: () => void;
}) {
  const [departmentId, setDepartmentId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !event) return;
    setDepartmentId(event.department_id ? String(event.department_id) : "");
    setAccessCode("");
    setError("");
  }, [isOpen, event]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!departmentId || accessCode.trim().length < 4) {
      setError("Select a department and enter an access code (min 4 characters).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await eventsApi.setAccessCode(event.event_id, {
        department_id: Number(departmentId),
        access_code: accessCode.trim(),
      });
      showToast("Access code saved. Write-only: it cannot be viewed again.", "success");
      setAccessCode("");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save access code."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Access Code · ${event?.title || ""}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs leading-relaxed text-slate-600">
          Access codes are write-only and cryptographically hashed on the server. Saving
          a new code replaces any prior code for the chosen department.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="acc-dept" className="mb-1 block text-xs font-semibold text-slate-700">
            Department *
          </label>
          <select
            id="acc-dept"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="acc-code" className="mb-1 block text-xs font-semibold text-slate-700">
            New Access Code *
          </label>
          <input
            id="acc-code"
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="input-field"
            placeholder="Minimum 4 characters"
            minLength={4}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Access Code"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
