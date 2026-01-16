import { Diamond, Users } from 'lucide-react';

import { paths } from './routes/paths';

export const navData = [
  /**
   * Home
   */
  {
    subheader: 'Primary',
    items: [
      {
        name: 'Home',
        url: paths.home,
        icon: <Diamond className='h-5 w-6' />,
      },
      {
        name: 'Users',
        url: paths.users,
        icon: <Users className='h-5 w-6' />,
      },
    ],
  },
];
