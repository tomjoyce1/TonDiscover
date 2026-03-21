import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/explore', label: 'Discovery', icon: '◉' },
  { to: '/create', label: 'Post', icon: '✚' },
  { to: '/profile', label: 'Profile', icon: '☻' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="td-bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={active ? 'td-bottom-nav-item td-bottom-nav-item-active' : 'td-bottom-nav-item'}
          >
            <span className="td-bottom-nav-icon" aria-hidden>{item.icon}</span>
            <span className="td-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
