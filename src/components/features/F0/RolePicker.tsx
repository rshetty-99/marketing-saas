'use client';

import { ROLE_DISPLAY, type WorkspaceRole } from '@/types/roles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RolePickerProps {
  roles: WorkspaceRole[];
  value: WorkspaceRole;
  onChange: (role: WorkspaceRole) => void;
  disabled?: boolean;
}

export function RolePicker({ roles, value, onChange, disabled }: RolePickerProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as WorkspaceRole)}
      disabled={disabled}
    >
      <SelectTrigger data-testid="role-picker" className="w-full">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => {
          const display = ROLE_DISPLAY[role];
          return (
            <SelectItem key={role} value={role}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{display.label}</span>
                <span className="text-muted-foreground text-[0.625rem]">
                  {display.description}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
