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

    return (
        <div></div>
    );
  }
};
export default FeedbackPage;