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
    <div className="feedback-container">
      <div className="feedback-header">
        <h1 className="feedback-title">Leave Feedback</h1>
        <p className="feedback-subtitle">Let us know how we can improve or report a bug.</p>
      </div>

      <div className="feedback-card">
        <form onSubmit={handleSubmit} className="feedback-form">
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
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
            className="form-textarea"
          />

          <button
            type="submit"
            className="submit-button"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;