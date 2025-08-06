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
};
export default FeedbackPage;