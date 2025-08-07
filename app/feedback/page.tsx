'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields.');
      return;
    }

    // You can replace this with an API call or Firestore/DB logic
    console.log('Feedback submitted:', formData);

    toast.success('Feedback submitted! Thank you.');
    setFormData({
      name: '',
      email: '',
      type: 'suggestion',
      message: '',
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Leave Feedback</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">Let us know how we can improve or report a bug.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring"
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring"
        />
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring"
        >
          <option value="suggestion">Suggestion</option>
          <option value="bug">Report a Bug</option>
          <option value="improvement">Improvement</option>
        </select>
        <textarea
          name="message"
          placeholder="Write your feedback here..."
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring resize-none"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;
