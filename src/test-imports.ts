// Simple test file to check if basic imports work on mobile
console.log('Starting basic import test...');

try {
  console.log('Testing React import...');
  import React from 'react';
  console.log('React imported successfully');
  
  console.log('Testing NotificationService import...');
  import { notificationService } from './Services/notificationService';
  console.log('NotificationService imported successfully');
  
  console.log('Testing context imports...');
  import { ParkingProvider } from './Context/ParkingContext';
  import { FavoritesProvider } from './Context/FavoritesContext';
  import { NotificationProvider } from './Context/NotificationContext';
  console.log('Context imports successful');
  
  console.log('All imports successful!');
} catch (error) {
  console.error('Import test failed:', error);
}
