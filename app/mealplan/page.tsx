'use client'
import React from 'react';

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
  days?: number;
}

const MealPlanDashboard = () => {

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.get('dietType')
  }

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">

        <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-emerald-500 text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            AI Meal Plan Generator
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor={'dietType'} className="block text-sm font-medium mb-1">
                Diet type
              </label>
              <input
                type={'text'} id={'dietType'} name={'dietType'}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Vegetarian, Keto, Mediterranean" required
              />
            </div>
            <div>
              <label htmlFor={'calories'} className="block text-sm font-medium mb-1">
                Daily calorie goal
              </label>
              <input
                type={'number'} id={'calories'} name={'calories'} min={500} max={15000} placeholder={'e.g. 2000'}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label htmlFor={'allergies'} className="block text-sm font-medium mb-1">
                Allergies
              </label>
              <input
                type={'text'} id={'allergies'} name={'allergies'} placeholder={'e.g. Nuts, Dairy, None'} required
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label htmlFor={'cuisine'} className="block text-sm font-medium mb-1">
                Preferred cuisine
              </label>
              <input
                type={'text'} id={'cuisine'} name={'cuisine'} placeholder={'e.g. Italian, Chines, No Preference'}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex items-center">
              <input
                type={'checkbox'} id={'snacks'} name={'snacks'}
                className="h-4 w-4 text-emerald-300 border-emerald-300 rounded"
              />
              <label htmlFor={'snacks'} className="ml-2 block text-sm text-white">
                Include snacks
              </label>
            </div>

            <div>
              <button type={'submit'}
                      className={`w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors`}
              >
                Generate meal plan
              </button>
            </div>
          </form>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4 p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-emerald-700">
            Weekly Meal Plan
          </h2>

        </div>

      </div>
    </div>
  );
};

export default MealPlanDashboard;