import LoadingOverlay from './LoadingOverlay';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { deleteUser } from 'firebase/auth';
import '../App.css'; // Make sure to import your CSS

export default function AccountSettings() {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const deleteMessages = [
    "Erasing habit history...", 
    "Removing profile data...", 
    "Saying goodbye..."
  ];

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        // Firebase will automatically log the user out.
        // Redirect to the auth/signup page
        navigate('/signup');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. You may need to log out and log back in to verify your identity before deleting.");
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="settings-container">

        {isDeleting && <LoadingOverlay messages={deleteMessages} />}

      <h1>Account Settings</h1>
      
      <div className="danger-zone">
        <h2>Delete Account</h2>
        <p>
          Once you delete your account, there is no going back. Please be certain. 
          All your habits, progress, and history will be permanently erased from FitBuddy.
        </p>
        <button className="btn-danger" onClick={() => setShowModal(true)}>
          Delete Account
        </button>
      </div>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Are you absolutely sure?</h3>
            <p>
              This action cannot be undone. This will permanently delete your 
              FitBuddy account and remove all your data from our servers.
            </p>
            <div className="modal-button-group">
              <button 
                className="btn-cancel" 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}