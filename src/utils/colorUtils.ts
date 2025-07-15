// Color utility functions for parking spots
export const getTypeColor = (type: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (type?.toLowerCase()) {
    case 'public':
    case 'ציבורי':
      return 'success';
    case 'private':
    case 'פרטי':
      return 'warning';
    case 'disabled':
    case 'נכים':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status?.toLowerCase()) {
    case 'פנוי':
    case 'available':
      return 'success';
    case 'מעט':
    case 'few':
      return 'warning';
    case 'מלא':
    case 'full':
      return 'error';
    case 'סגור':
    case 'closed':
      return 'error';
    case 'פעיל':
    case 'active':
      return 'success';
    default:
      return 'default';
  }
};

export const getParkingTypeColor = (spot: any): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
  if (spot.code_achoza?.includes('private')) {
    return 'warning';
  }
  if (spot.code_achoza?.includes('public')) {
    return 'primary';
  }
  return 'default';
};
