import { useState, useEffect } from 'react';

export const useCandidateForm = (userInfo) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || "",
                email: userInfo.email || "",
                phone: userInfo.phone || "",
            });
        }
    }, [userInfo]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return { formData, handleFormChange, setFormData };
};