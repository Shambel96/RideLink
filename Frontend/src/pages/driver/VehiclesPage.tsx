import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Car,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { vehiclesApi, CreateVehiclePayload, UpdateVehiclePayload } from '../../api/vehicles.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Vehicle, VehicleType } from '../../types';

const vehicleSchema = z.object({
  plateNumber: z.string().min(3, 'Plate number is required (e.g. 3-AA-12345)'),
  model: z.string().min(2, 'Vehicle model is required (e.g. Toyota Corolla)'),
  type: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'MINIVAN', 'MOTORCYCLE']),
  year: z.number().min(1990).max(new Date().getFullYear() + 1).optional(),
});

type VehicleFormValues = {
  plateNumber: string;
  model: string;
  type: 'SEDAN' | 'SUV' | 'HATCHBACK' | 'MINIVAN' | 'MOTORCYCLE';
  year?: number;
};

export const VehiclesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteModalVehicle, setDeleteModalVehicle] = useState<Vehicle | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.findMine(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      plateNumber: '',
      model: '',
      type: 'SEDAN',
      year: 2020,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: unknown) => {
      setModalError(err instanceof Error ? err.message : 'Failed to register vehicle');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehiclePayload }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setModalOpen(false);
      setEditingVehicle(null);
      reset();
    },
    onError: (err: unknown) => {
      setModalError(err instanceof Error ? err.message : 'Failed to update vehicle');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setDeleteModalVehicle(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setModalError(null);
    reset({
      plateNumber: '',
      model: '',
      type: 'SEDAN',
      year: 2020,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setModalError(null);
    setValue('plateNumber', v.plateNumber);
    setValue('model', v.model);
    setValue('type', v.type);
    setValue('year', v.year || 2020);
    setModalOpen(true);
  };

  const onSubmit = (values: VehicleFormValues) => {
    setModalError(null);
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register and configure vehicles you will drive on the RideLink platform
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold text-slate-950"
        >
          Add Vehicle
        </Button>
      </div>

      {/* Fleet Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-44 w-full" />
          ))}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Vehicles Registered"
          description="You haven't added any vehicles to your driver profile yet. Approved drivers need at least one vehicle to accept rides."
          actionLabel="Add Your First Vehicle"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              variant="elevated"
              className="p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <Car className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {vehicle.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{vehicle.model}</h3>
                  <p className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md inline-block mt-1">
                    {vehicle.plateNumber}
                  </p>
                </div>

                {vehicle.year && (
                  <p className="text-xs text-slate-500">Year of Manufacture: {vehicle.year}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(vehicle)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => setDeleteModalVehicle(vehicle)}
                  aria-label="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
        description="Vehicles must match official registration plates."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="License Plate Number"
            placeholder="e.g. 3-AA-12345"
            error={errors.plateNumber?.message}
            {...register('plateNumber')}
          />

          <Input
            label="Vehicle Model"
            placeholder="e.g. Toyota Corolla"
            error={errors.model?.message}
            {...register('model')}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Vehicle Type
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900"
              {...register('type')}
            >
              <option value="SEDAN">SEDAN</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">HATCHBACK</option>
              <option value="MINIVAN">MINIVAN</option>
              <option value="MOTORCYCLE">MOTORCYCLE</option>
            </select>
          </div>

          <Input
            label="Year of Manufacture"
            type="number"
            placeholder="2020"
            error={errors.year?.message}
            {...register('year')}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalVehicle)}
        onClose={() => setDeleteModalVehicle(null)}
        title="Remove Vehicle?"
        description={`Are you sure you want to remove ${deleteModalVehicle?.model} (${deleteModalVehicle?.plateNumber}) from your fleet?`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalVehicle(null)}>
              Keep Vehicle
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (deleteModalVehicle) {
                  deleteMutation.mutate(deleteModalVehicle.id);
                }
              }}
            >
              Confirm Removal
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          This vehicle will no longer be available for dispatch on subsequent rides.
        </p>
      </Modal>
    </div>
  );
};
