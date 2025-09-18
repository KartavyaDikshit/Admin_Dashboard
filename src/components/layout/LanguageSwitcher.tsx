'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;
    // This regex replaces the existing locale in the path
    const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${newLocale}$1`);
    router.push(newPath);
  };

  const currentLocale = pathname ? pathname.split('/')[1] || 'en' : 'en';

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <GlobeAltIcon className="mr-2 h-5 w-5 text-gray-500" />
          {currentLocale.toUpperCase()}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {locales.map((locale) => (
              <Menu.Item key={locale}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(locale)}
                    className={`${ 
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      currentLocale === locale ? 'font-bold bg-gray-50' : 'font-normal'
                    } block w-full text-left px-4 py-2 text-sm`}
                  >
                    {locale.toUpperCase()}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
