import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Valid phone number required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain uppercase, lowercase, and a number',
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setProfileSuccess(true);
      setProfileError(null);
      setTimeout(() => setProfileSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) => usersApi.changePassword(data),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      resetPasswordForm();
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => usersApi.deleteAccount(),
    onSuccess: async () => {
      await logout();
      window.location.href = '/login';
    },
    onError: (err: unknown) => {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete account');
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your credentials, phone number, and security preferences
        </p>
      </div>

      {/* Account Details Card */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-xl shadow-subtle">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user?.roles.map((r) => (
              <Badge key={r} status={r} size="sm" />
            ))}
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleProfileSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Personal Information
          </h3>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}
          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              leftIcon={<User className="w-4 h-4" />}
              error={profileErrors.name?.message}
              {...registerProfile('name')}
            />

            <Input
              label="Phone Number"
              leftIcon={<Phone className="w-4 h-4" />}
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateProfileMutation.isPending}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-500" />
          Security & Password
        </h3>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}
        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4">
          <Input
            label="Current Password"
            isPassword
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />

          <Input
            label="New Password"
            isPassword
            leftIcon={<Lock className="w-4 h-4" />}
            helperText="At least 8 characters with uppercase, lowercase, and numbers"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={changePasswordMutation.isPending}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="p-6 border-rose-200 bg-rose-50/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-900">Danger Zone</h4>
            <p className="text-xs text-rose-600 mt-0.5">
              Permanently delete your account, rides history, and all stored data.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteModalOpen(true);
            }}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        description="This action cannot be reversed. All your ride records, profile, and associated credentials will be permanently erased."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              Confirm Permanent Deletion
            </Button>
          </>
        }
      >
        {deleteError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {deleteError}
          </div>
        )}
      </Modal>
    </div>
  );
};
