import React from 'react';
import { Link } from 'react-router-dom';
import { HiHome, HiFire, HiCollection, HiClock, HiThumbUp, HiVideoCamera } from 'react-icons/hi';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { icon: <HiHome size={24} />, label: 'Home', path: '/' },
    { icon: <HiFire size={24} />, label: 'Trending', path: '/trending' },
    { icon: <HiCollection size={24} />, label: 'Subscriptions', path: '/subscriptions' },
    { icon: <HiVideoCamera size={24} />, label: 'Library', path: '/library' },
    { icon: <HiClock size={24} />, label: 'History', path: '/history' },
    { icon: <HiThumbUp size={24} />, label: 'Liked videos', path: '/liked' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-[#0f0f0f] transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="pt-16">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 cursor-pointer"
          >
            <span className="mr-4">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar; 