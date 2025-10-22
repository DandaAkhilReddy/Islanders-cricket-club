import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { DollarSign, Save, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Expense, ExpenseCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
}

export default function ExpenseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ExpenseFormData>({
    defaultValues: {
      category: 'Miscellaneous',
      amount: 0,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchExpense(id);
    }
  }, [id, isEditMode]);

  async function fetchExpense(expenseId: string) {
    try {
      setLoading(true);
      const expenseDoc = await getDoc(doc(db, 'expenses', expenseId));

      if (expenseDoc.exists()) {
        const expenseData = expenseDoc.data() as Expense;

        // Convert date to string format for input
        const dateObj = expenseData.date instanceof Date ? expenseData.date : (expenseData.date as any).toDate();
        const dateString = dateObj.toISOString().split('T')[0];

        reset({
          date: dateString,
          category: expenseData.category,
          amount: expenseData.amount,
          description: expenseData.description,
        });
      } else {
        toast.error('Expense not found');
        navigate('/admin/budget');
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      toast.error('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ExpenseFormData) {
    if (!currentUser) {
      toast.error('You must be logged in to add expenses');
      return;
    }

    try {
      setLoading(true);

      const expenseData: Omit<Expense, 'id'> = {
        date: new Date(data.date),
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        createdBy: currentUser.uid,
        createdAt: new Date(),
      };

      if (isEditMode && id) {
        await setDoc(doc(db, 'expenses', id), expenseData);
        toast.success('Expense updated successfully!');
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        toast.success('Expense added successfully!');
      }

      navigate('/admin/budget');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditMode) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-soft-orange-200 border-t-soft-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expense...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update expense details' : 'Record a new expense'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/budget')}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6">
            <div className="space-y-6">
              {/* Expense Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-orange-500 focus:border-transparent"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-orange-500 focus:border-transparent"
                    >
                      <option value="Equipment">Equipment</option>
                      <option value="Ground Fees">Ground Fees</option>
                      <option value="Travel">Travel</option>
                      <option value="Tournament Fees">Tournament Fees</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Team Kit">Team Kit</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('amount', {
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-orange-500 focus:border-transparent"
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      placeholder="e.g., Cricket balls for practice session"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-orange-500 focus:border-transparent"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/budget')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
