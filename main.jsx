import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  Search,
  Package,
  Flower2,
  Gift,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';

import {
  INITIAL_PRODUCTS,
  INITIAL_FLOWERS,
  INITIAL_ARRANGEMENTS,
} from './data';

/* ============================================================
   STORAGE SETTINGS

   IMPORTANT:
   This version uses completely new storage keys.

   It also has a data version.

   If the version changes, the app resets ONLY its own saved
   dashboard data and reloads the clean information from data.js.

   This means none of the corrupted storage from our previous
   attempts should be loaded.
============================================================ */

const DATA_VERSION = 'TCG-CLEAN-2026-08-09-V1';

const STORAGE_KEYS = {
  version: 'tcg_dashboard_data_version_v1',
  products: 'tcg_dashboard_products_v1',
  flowers: 'tcg_dashboard_flowers_v1',
  arrangements: 'tcg_dashboard_arrangements_v1',
};

/* ============================================================
   LOAD SAVED ARRAY
============================================================ */

function loadSavedArray(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    return fallback;
  }
}

/* ============================================================
   APP
============================================================ */

function App() {
  /* ----------------------------------------------------------
     STORAGE VERSION CHECK

     This runs INSIDE the actual preview app.

     Therefore we do not need to rely on DevTools
     localStorage.clear().
  ---------------------------------------------------------- */

  try {
    const existingVersion = localStorage.getItem(
      STORAGE_KEYS.version
    );

    if (existingVersion !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.products);
      localStorage.removeItem(STORAGE_KEYS.flowers);
      localStorage.removeItem(STORAGE_KEYS.arrangements);

      localStorage.setItem(
        STORAGE_KEYS.version,
        DATA_VERSION
      );
    }
  } catch (error) {
    console.error(
      'Could not initialise dashboard storage:',
      error
    );
  }

  /* ==========================================================
     BASIC UI STATE
  ========================================================== */

  const [darkMode, setDarkMode] = useState(false);

  const [activeTab, setActiveTab] =
    useState('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [zoomedImage, setZoomedImage] =
    useState(null);

  /* ==========================================================
     MAIN APP DATA
  ========================================================== */

  const [products, setProducts] = useState(() =>
    loadSavedArray(
      STORAGE_KEYS.products,
      INITIAL_PRODUCTS
    )
  );

  const [masterFlowers, setMasterFlowers] =
    useState(() =>
      loadSavedArray(
        STORAGE_KEYS.flowers,
        INITIAL_FLOWERS
      )
    );

  const [arrangements, setArrangements] =
    useState(() =>
      loadSavedArray(
        STORAGE_KEYS.arrangements,
        INITIAL_ARRANGEMENTS
      )
    );

  /* ==========================================================
     AUTO SAVE
  ========================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.products,
        JSON.stringify(products)
      );
    } catch (error) {
      console.error(
        'Could not save products:',
        error
      );
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.flowers,
        JSON.stringify(masterFlowers)
      );
    } catch (error) {
      console.error(
        'Could not save flowers:',
        error
      );
    }
  }, [masterFlowers]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.arrangements,
        JSON.stringify(arrangements)
      );
    } catch (error) {
      console.error(
        'Could not save arrangements:',
        error
      );
    }
  }, [arrangements]);

  /* ==========================================================
     KEEP SELECTED PRODUCT UPDATED
  ========================================================== */

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const latestProduct = products.find(
      product =>
        product.id === selectedProduct.id
    );

    if (latestProduct) {
      setSelectedProduct(latestProduct);
    } else {
      setSelectedProduct(null);
    }
  }, [products]);

  /* ==========================================================
     MODALS
  ========================================================== */

  const [
    isAddingModal,
    setIsAddingModal,
  ] = useState(false);

  const [
    isAddingFlowerModal,
    setIsAddingFlowerModal,
  ] = useState(false);

  const [
    isAddingArrangementModal,
    setIsAddingArrangementModal,
  ] = useState(false);

  /* ==========================================================
     FLOWER PICKER - PRODUCT DETAIL
  ========================================================== */

  const [
    isFlowerPickerOpen,
    setIsFlowerPickerOpen,
  ] = useState(false);

  const [
    flowerPickerSearch,
    setFlowerPickerSearch,
  ] = useState('');

  const [
    selectedMasterFlower,
    setSelectedMasterFlower,
  ] = useState(null);

  const [
    recipeFlowerCount,
    setRecipeFlowerCount,
  ] = useState(1);

  const pickerRef = useRef(null);

  /* ==========================================================
     FLOWER PICKER - ADD BOUQUET
  ========================================================== */

  const [
    isModalPickerOpen,
    setIsModalPickerOpen,
  ] = useState(false);

  const [
    modalPickerSearch,
    setModalPickerSearch,
  ] = useState('');

  const [
    selectedModalFlower,
    setSelectedModalFlower,
  ] = useState(null);

  const [
    modalFlowerCount,
    setModalFlowerCount,
  ] = useState(1);

  const [
    newModalFlowersList,
    setNewModalFlowersList,
  ] = useState([]);

  const modalPickerRef = useRef(null);

  /* ==========================================================
     CLOSE PICKERS WHEN CLICKING OUTSIDE
  ========================================================== */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target
        )
      ) {
        setIsFlowerPickerOpen(false);
      }

      if (
        modalPickerRef.current &&
        !modalPickerRef.current.contains(
          event.target
        )
      ) {
        setIsModalPickerOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  /* ==========================================================
     NEW PRODUCT FORM
  ========================================================== */

  const [newName, setNewName] =
    useState('');

  const [
    newCategory,
    setNewCategory,
  ] = useState('ready-bouquets');

  const [newPrice, setNewPrice] =
    useState('');

  const [newImage, setNewImage] =
    useState('');

  /* ==========================================================
     NEW FLOWER FORM
  ========================================================== */

  const [
    newFlowerDbName,
    setNewFlowerDbName,
  ] = useState('');

  const [
    newFlowerDbImage,
    setNewFlowerDbImage,
  ] = useState('');

  /* ==========================================================
     NEW ARRANGEMENT FORM
  ========================================================== */

  const [
    newArrangementName,
    setNewArrangementName,
  ] = useState('');

  const [
    newArrangementPrice,
    setNewArrangementPrice,
  ] = useState('');

  const [
    newArrangementImage,
    setNewArrangementImage,
  ] = useState('');

  /* ==========================================================
     FLOWER IMAGE RESOLUTION

     THIS IS IMPORTANT.

     1. First use the exact image already stored in the
        bouquet recipe.

     2. If that image is missing, look for an EXACT name match.

     3. There is NO partial name matching.

     Therefore:
       Lily
       Star Lily
       Waterlily
       Lily of the Valley

     can NEVER be confused just because they contain "lily".
  ========================================================== */

  function getFlowerImage(flower) {
    if (
      flower &&
      typeof flower.image === 'string' &&
      flower.image.trim() !== ''
    ) {
      return flower.image;
    }

    if (!flower?.name) {
      return '';
    }

    const exactMatch =
      masterFlowers.find(
        masterFlower =>
          masterFlower.name
            .trim()
            .toLowerCase() ===
          flower.name
            .trim()
            .toLowerCase()
      );

    if (exactMatch?.image) {
      return exactMatch.image;
    }

    return '';
  }

  /* ==========================================================
     ADD PRODUCT
  ========================================================== */

  function handleAddProduct(event) {
    event.preventDefault();

    if (!newName || !newPrice) {
      return;
    }

    const newProduct = {
      id: `product-${Date.now()}`,

      name: newName.trim(),

      category: newCategory,

      price: newPrice
        .toUpperCase()
        .includes('QAR')
        ? newPrice.trim()
        : `${newPrice.trim()} QAR`,

      image:
        newImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/1001nights.png',

      flowers: newModalFlowersList,
    };

    setProducts(previous => [
      newProduct,
      ...previous,
    ]);

    setNewName('');
    setNewPrice('');
    setNewImage('');
    setNewModalFlowersList([]);
    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');

    setIsAddingModal(false);
  }

  /* ==========================================================
     ADD FLOWER TO NEW PRODUCT
  ========================================================== */

  function handleAddFlowerToModal(
    event
  ) {
    event.preventDefault();

    if (!selectedModalFlower) {
      return;
    }

    const newFlowerItem = {
      name:
        selectedModalFlower.name,

      count:
        parseInt(
          modalFlowerCount,
          10
        ) || 1,

      image:
        selectedModalFlower.image,
    };

    setNewModalFlowersList(
      previous => [
        ...previous,
        newFlowerItem,
      ]
    );

    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');
  }

  function handleRemoveModalFlower(
    index
  ) {
    setNewModalFlowersList(
      previous =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  }

  /* ==========================================================
     ADD MASTER FLOWER
  ========================================================== */

  function handleAddMasterFlower(
    event
  ) {
    event.preventDefault();

    if (!newFlowerDbName.trim()) {
      return;
    }

    const newFlower = {
      id: `flower-${Date.now()}`,

      name:
        newFlowerDbName.trim(),

      image:
        newFlowerDbImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/botanicalleaf.png',
    };

    setMasterFlowers(
      previous => [
        newFlower,
        ...previous,
      ]
    );

    setNewFlowerDbName('');
    setNewFlowerDbImage('');

    setIsAddingFlowerModal(false);
  }

  /* ==========================================================
     ADD ARRANGEMENT
  ========================================================== */

  function handleAddArrangement(
    event
  ) {
    event.preventDefault();

    if (
      !newArrangementName.trim() ||
      !newArrangementPrice.trim()
    ) {
      return;
    }

    const arrangementName =
      newArrangementName.trim();

    const newArrangement = {
      id: `arrangement-${Date.now()}`,

      name: arrangementName,

      price:
        newArrangementPrice
          .toUpperCase()
          .includes('QAR')
          ? newArrangementPrice.trim()
          : `${newArrangementPrice.trim()} QAR`,

      image:
        newArrangementImage.trim() ||
        `https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/${arrangementName}.png`,
    };

    setArrangements(
      previous => [
        newArrangement,
        ...previous,
      ]
    );

    setNewArrangementName('');
    setNewArrangementPrice('');
    setNewArrangementImage('');

    setIsAddingArrangementModal(
      false
    );
  }

  /* ==========================================================
     DELETE FLOWER
  ========================================================== */

  function handleDeleteMasterFlower(
    id,
    event
  ) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this flower from the database?'
    );

    if (!confirmed) {
      return;
    }

    setMasterFlowers(
      previous =>
        previous.filter(
          flower =>
            flower.id !== id
        )
    );
  }

  /* ==========================================================
     DELETE ARRANGEMENT
  ========================================================== */

  function handleDeleteArrangement(
    id,
    event
  ) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this arrangement?'
    );

    if (!confirmed) {
      return;
    }

    setArrangements(
      previous =>
        previous.filter(
          arrangement =>
            arrangement.id !== id
        )
    );
  }

  /* ==========================================================
     DELETE PRODUCT
  ========================================================== */

  function handleDeleteProduct(
    id,
    event
  ) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this bouquet?'
    );

    if (!confirmed) {
      return;
    }

    setProducts(
      previous =>
        previous.filter(
          product =>
            product.id !== id
        )
    );

    if (
      selectedProduct?.id === id
    ) {
      setSelectedProduct(null);
    }
  }

  /* ==========================================================
     ADD FLOWER TO EXISTING PRODUCT
  ========================================================== */

  function handleAddFlowerToProduct(
    event
  ) {
    event.preventDefault();

    if (
      !selectedMasterFlower ||
      !selectedProduct
    ) {
      return;
    }

    const flowerToAdd = {
      name:
        selectedMasterFlower.name,

      count:
        parseInt(
          recipeFlowerCount,
          10
        ) || 1,

      image:
        selectedMasterFlower.image,
    };

    const updatedProduct = {
      ...selectedProduct,

      flowers: [
        ...(selectedProduct.flowers ||
          []),

        flowerToAdd,
      ],
    };

    setProducts(
      previous =>
        previous.map(product =>
          product.id ===
          updatedProduct.id
            ? updatedProduct
            : product
        )
    );

    setSelectedMasterFlower(null);
    setRecipeFlowerCount(1);
    setFlowerPickerSearch('');
  }

  /* ==========================================================
     REMOVE FLOWER FROM PRODUCT
  ========================================================== */

  function handleRemoveFlower(
    flowerIndex
  ) {
    if (!selectedProduct) {
      return;
    }

    const updatedFlowers =
      (
        selectedProduct.flowers ||
        []
      ).filter(
        (_, index) =>
          index !== flowerIndex
      );

    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };

    setProducts(
      previous =>
        previous.map(product =>
          product.id ===
          updatedProduct.id
            ? updatedProduct
            : product
        )
    );
  }

  /* ==========================================================
     SEARCH / FILTER
  ========================================================== */

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredProducts =
    products.filter(product => {
      const matchesTab =
        activeTab === 'all' ||
        product.category ===
          activeTab;

      const matchesSearch =
        (product.name || '')
          .toLowerCase()
          .includes(
            normalizedSearch
          );

      return (
        matchesTab &&
        matchesSearch
      );
    });

  const filteredMasterFlowers =
    masterFlowers.filter(
      flower =>
        (flower.name || '')
          .toLowerCase()
          .includes(
            normalizedSearch
          )
    );

  const filteredArrangements =
    arrangements.filter(
      arrangement =>
        (
          arrangement.name || ''
        )
          .toLowerCase()
          .includes(
            normalizedSearch
          )
    );

  const searchablePickerFlowers =
    masterFlowers.filter(
      flower =>
        (flower.name || '')
          .toLowerCase()
          .includes(
            flowerPickerSearch
              .toLowerCase()
          )
    );

  const modalSearchableFlowers =
    masterFlowers.filter(
      flower =>
        (flower.name || '')
          .toLowerCase()
          .includes(
            modalPickerSearch
              .toLowerCase()
          )
    );

  /* ==========================================================
     SAFE IMAGE COMPONENT

     We deliberately DO NOT replace a broken bouquet flower
     image with Botanical Leaf.

     If an image is missing, you will see "Image unavailable".

     That way a broken record cannot masquerade as another flower.
  ========================================================== */

  function FlowerImage({
    flower,
    className = '',
  }) {
    const [failed, setFailed] =
      useState(false);

    const image =
      getFlowerImage(flower);

    if (!image || failed) {
      return (
        <div
          className={`flex items-center justify-center text-center text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 ${className}`}
        >
          Image unavailable
        </div>
      );
    }

    return (
      <img
        src={image}
        alt={flower?.name || ''}
        className={className}
        onError={() =>
          setFailed(true)
        }
      />
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className={`${
        darkMode
          ? 'dark bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      } min-h-screen font-sans transition-colors duration-300 flex`}
    >
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`${
          sidebarOpen
            ? 'w-64 p-6'
            : 'w-20 p-4'
        } ${
          darkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        } border-r flex flex-col justify-between transition-all duration-300 sticky top-0 h-screen z-20`}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md shrink-0">
                  <img
                    src="https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/logo.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h1 className="font-bold text-base leading-tight tracking-tight">
                    The Crochet Garden
                  </h1>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Product Dashboard
                  </span>
                </div>
              </div>
            )}

            {!sidebarOpen && (
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md mx-auto">
                <img
                  src="https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/logo.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <button
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              className={`p-2 rounded-xl border ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              } hover:opacity-80 transition-all ${
                sidebarOpen
                  ? ''
                  : 'hidden'
              }`}
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {!sidebarOpen && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className={`p-2 rounded-xl border ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                } hover:opacity-80 transition-all`}
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          <nav className="space-y-2">
            {[
              {
                id: 'all',
                label:
                  'All Products',
                icon: Package,
              },
              {
                id: 'single-flowers',
                label:
                  'Single Flowers',
                icon: Flower2,
              },
              {
                id: 'ready-bouquets',
                label:
                  'Ready Bouquets',
                icon: Gift,
              },
              {
                id: 'arrangements',
                label:
                  'Arrangements',
                icon: Sparkles,
              },
            ].map(tab => {
              const Icon =
                tab.icon;

              const isActive =
                activeTab ===
                  tab.id &&
                !selectedProduct;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(
                      tab.id
                    );

                    setSelectedProduct(
                      null
                    );

                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-500/20 to-slate-600/30 text-slate-900 dark:text-white border border-slate-400/30 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                  title={
                    !sidebarOpen
                      ? tab.label
                      : ''
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  {sidebarOpen && (
                    <span>
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div
            className={`p-3 rounded-2xl ${
              darkMode
                ? 'bg-slate-800/50'
                : 'bg-slate-100'
            } flex items-center justify-between`}
          >
            {sidebarOpen && (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dark Mode
              </span>
            )}

            <button
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors mx-auto ${
                darkMode
                  ? 'bg-slate-700'
                  : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  darkMode
                    ? 'translate-x-6'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {selectedProduct && (
          <button
            onClick={() =>
              setSelectedProduct(
                null
              )
            }
            className={`fixed top-8 ${
              sidebarOpen
                ? 'left-72'
                : 'left-24'
            } z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-xl border transition-all hover:scale-105 ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-white shadow-black/50'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedProduct
                ? 'Order Breakdown'
                : activeTab ===
                    'single-flowers'
                  ? 'Single Flowers Database'
                  : activeTab ===
                      'arrangements'
                    ? 'Arrangements Collection'
                    : 'Product Dashboard'}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {selectedProduct
                ? 'Verify items needed instantly for your Snoonu order.'
                : activeTab ===
                    'single-flowers'
                  ? 'Master inventory of all individual flowers used across bouquets.'
                  : activeTab ===
                      'arrangements'
                    ? 'Master catalog of pre-designed arrangements.'
                    : `Showing ${filteredProducts.length} items in your catalog.`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div
              className={`relative flex items-center w-full md:w-80 ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              } rounded-2xl border shadow-sm px-4 py-2.5`}
            >
              <Search className="w-4 h-4 text-slate-400 mr-2.5" />

              <input
                type="text"
                placeholder={
                  activeTab ===
                  'single-flowers'
                    ? 'Search flowers...'
                    : activeTab ===
                        'arrangements'
                      ? 'Search arrangements...'
                      : 'Search bouquets...'
                }
                value={searchQuery}
                onChange={event =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              />
            </div>

            {!selectedProduct &&
              activeTab ===
                'ready-bouquets' && (
                <button
                  onClick={() =>
                    setIsAddingModal(
                      true
                    )
                  }
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                  title="Add New Bouquet"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}

            {!selectedProduct &&
              activeTab ===
                'single-flowers' && (
                <button
                  onClick={() =>
                    setIsAddingFlowerModal(
                      true
                    )
                  }
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                  title="Add Flower to DB"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}

            {!selectedProduct &&
              activeTab ===
                'arrangements' && (
                <button
                  onClick={() =>
                    setIsAddingArrangementModal(
                      true
                    )
                  }
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                  title="Add Arrangement"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
          </div>
        </div>

        {/* ====================================================
            SINGLE FLOWERS
        ==================================================== */}

        {activeTab ===
          'single-flowers' &&
        !selectedProduct ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMasterFlowers.map(
                flower => (
                  <div
                    key={flower.id}
                    className={`group relative ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    } border rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center`}
                  >
                    <button
                      onClick={event =>
                        handleDeleteMasterFlower(
                          flower.id,
                          event
                        )
                      }
                      className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      title="Delete flower from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className="w-24 h-24 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 shadow-inner cursor-pointer"
                      onClick={() =>
                        setZoomedImage(
                          flower.image
                        )
                      }
                    >
                      <img
                        src={flower.image}
                        alt={flower.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    <h4 className="font-bold text-sm">
                      {flower.name}
                    </h4>
                  </div>
                )
              )}
            </div>

            {filteredMasterFlowers.length ===
              0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No flowers found in database.
                </p>
              </div>
            )}
          </div>
        ) : activeTab ===
            'arrangements' &&
          !selectedProduct ? (
          /* ==================================================
             ARRANGEMENTS
          ================================================== */

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArrangements.map(
                arrangement => (
                  <div
                    key={
                      arrangement.id
                    }
                    className={`group relative ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    } border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center`}
                  >
                    <button
                      onClick={event =>
                        handleDeleteArrangement(
                          arrangement.id,
                          event
                        )
                      }
                      className="absolute top-3 right-3 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      title="Delete arrangement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div
                      className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 shadow-inner cursor-pointer"
                      onClick={() =>
                        setZoomedImage(
                          arrangement.image
                        )
                      }
                    >
                      <img
                        src={
                          arrangement.image
                        }
                        alt={
                          arrangement.name
                        }
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h4 className="font-bold text-base mb-1">
                      {arrangement.name}
                    </h4>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {
                        arrangement.price
                      }
                    </span>
                  </div>
                )
              )}
            </div>

            {filteredArrangements.length ===
              0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No arrangements found matching search.
                </p>
              </div>
            )}
          </div>
        ) : selectedProduct ? (
          /* ==================================================
             PRODUCT DETAIL
          ================================================== */

          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div
                className={`lg:col-span-1 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                } border rounded-3xl p-6 shadow-sm flex flex-col items-center text-center`}
              >
                <div
                  className="w-full aspect-square rounded-2xl overflow-hidden mb-5 shadow-md bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  onClick={() =>
                    setZoomedImage(
                      selectedProduct.image
                    )
                  }
                >
                  <img
                    src={
                      selectedProduct.image
                    }
                    alt={
                      selectedProduct.name
                    }
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-3">
                  {
                    selectedProduct.price
                  }
                </span>

                <h3 className="text-xl font-bold mb-2">
                  {
                    selectedProduct.name
                  }
                </h3>
              </div>

              <div
                className={`lg:col-span-2 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                } border rounded-3xl p-6 md:p-8 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-lg">
                      Required Flowers & Components
                    </h4>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Select from master flower database to add or remove ingredients
                    </p>
                  </div>
                </div>

                {/* ============================================
                    ADD FLOWER PICKER
                ============================================ */}

                <form
                  onSubmit={
                    handleAddFlowerToProduct
                  }
                  className="flex gap-2 mb-6 relative"
                >
                  <div
                    className="relative flex-1"
                    ref={pickerRef}
                  >
                    <div
                      onClick={() =>
                        setIsFlowerPickerOpen(
                          !isFlowerPickerOpen
                        )
                      }
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm cursor-pointer ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedMasterFlower ? (
                          <>
                            <img
                              src={
                                selectedMasterFlower.image
                              }
                              alt=""
                              className="w-6 h-6 rounded-lg object-cover"
                            />

                            <span className="font-medium">
                              {
                                selectedMasterFlower.name
                              }
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">
                            Select a flower from database...
                          </span>
                        )}
                      </div>

                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>

                    {isFlowerPickerOpen && (
                      <div
                        className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl z-30 p-3 ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div
                          className={`flex items-center px-3 py-2 rounded-xl border mb-3 ${
                            darkMode
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <Search className="w-4 h-4 text-slate-400 mr-2" />

                          <input
                            type="text"
                            placeholder="Type to search flower..."
                            value={
                              flowerPickerSearch
                            }
                            onChange={event =>
                              setFlowerPickerSearch(
                                event
                                  .target
                                  .value
                              )
                            }
                            autoFocus
                            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400"
                          />
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                          {searchablePickerFlowers.map(
                            flower => (
                              <div
                                key={
                                  flower.id
                                }
                                onClick={() => {
                                  setSelectedMasterFlower(
                                    flower
                                  );

                                  setIsFlowerPickerOpen(
                                    false
                                  );

                                  setFlowerPickerSearch(
                                    ''
                                  );
                                }}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                                  selectedMasterFlower?.id ===
                                  flower.id
                                    ? 'bg-slate-500/20 border border-slate-400/40'
                                    : darkMode
                                      ? 'hover:bg-slate-800'
                                      : 'hover:bg-slate-100'
                                }`}
                              >
                                <img
                                  src={
                                    flower.image
                                  }
                                  alt={
                                    flower.name
                                  }
                                  className="w-9 h-9 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                                />

                                <span className="text-xs font-bold leading-tight">
                                  {
                                    flower.name
                                  }
                                </span>
                              </div>
                            )
                          )}

                          {searchablePickerFlowers.length ===
                            0 && (
                            <p className="text-xs text-slate-400 text-center py-4">
                              No flowers found matching search.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={
                      recipeFlowerCount
                    }
                    onChange={event =>
                      setRecipeFlowerCount(
                        event.target.value
                      )
                    }
                    className={`w-20 px-3 py-2.5 rounded-xl border text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    } outline-none shadow-sm`}
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-4 h-4" />

                    Add
                  </button>
                </form>

                {/* ============================================
                    RECIPE FLOWERS
                ============================================ */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    selectedProduct.flowers ||
                    []
                  ).map(
                    (
                      flower,
                      index
                    ) => {
                      const resolvedImage =
                        getFlowerImage(
                          flower
                        );

                      return (
                        <div
                          key={`${selectedProduct.id}-${index}-${flower.name}`}
                          className={`relative flex items-center justify-between p-3.5 rounded-2xl border ${
                            darkMode
                              ? 'bg-slate-800/40 border-slate-800'
                              : 'bg-slate-50 border-slate-100'
                          } transition-all`}
                        >
                          <button
                            onClick={() =>
                              handleRemoveFlower(
                                index
                              )
                            }
                            className="absolute top-2.5 right-2.5 bg-slate-900 dark:bg-slate-700 text-white p-1.5 rounded-full hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md"
                            title="Remove flower"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-4 pr-6">
                            <div
                              className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md shrink-0 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                              onClick={() => {
                                if (
                                  resolvedImage
                                ) {
                                  setZoomedImage(
                                    resolvedImage
                                  );
                                }
                              }}
                            >
                              <FlowerImage
                                flower={
                                  flower
                                }
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>

                            <div>
                              <h5 className="font-bold text-sm leading-tight mb-1">
                                {
                                  flower.name
                                }
                              </h5>

                              <span className="text-xs text-slate-400 font-medium">
                                Qty:{' '}
                                {
                                  flower.count
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================
             PRODUCT GRID
          ================================================== */

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(
                product => (
                  <div
                    key={product.id}
                    onClick={() =>
                      setSelectedProduct(
                        product
                      )
                    }
                    className={`group cursor-pointer ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    } border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative`}
                  >
                    <button
                      onClick={event =>
                        handleDeleteProduct(
                          product.id,
                          event
                        )
                      }
                      className="absolute top-3 left-3 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                          {
                            product.price
                          }
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-base mb-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                          {
                            product.name
                          }
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`px-5 py-4 border-t ${
                        darkMode
                          ? 'border-slate-800/80'
                          : 'border-slate-100'
                      } flex items-center justify-between`}
                    >
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Flower2 className="w-3.5 h-3.5 text-slate-500" />

                        {
                          (
                            product.flowers ||
                            []
                          ).length
                        }{' '}
                        flower types
                      </span>

                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details

                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {filteredProducts.length ===
              0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No products found matching your search.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================
          IMAGE ZOOM
      ====================================================== */}

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() =>
            setZoomedImage(null)
          }
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={event =>
              event.stopPropagation()
            }
          >
            <button
              onClick={() =>
                setZoomedImage(
                  null
                )
              }
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={zoomedImage}
              alt="Zoomed View"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white/5 p-2"
            />
          </div>
        </div>
      )}

      {/* ======================================================
          ADD PRODUCT MODAL
      ====================================================== */}

      {isAddingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            } border rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}
          >
            <h3 className="text-lg font-bold mb-4">
              Add New Product
            </h3>

            <form
              onSubmit={
                handleAddProduct
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Product Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Damascus Rose"
                  value={newName}
                  onChange={event =>
                    setNewName(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Category
                </label>

                <select
                  value={newCategory}
                  onChange={event =>
                    setNewCategory(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                >
                  <option value="ready-bouquets">
                    Ready Bouquets
                  </option>

                  <option value="arrangements">
                    Arrangements
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Price (QAR)
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. 190 QAR"
                  value={newPrice}
                  onChange={event =>
                    setNewPrice(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Image URL
                </label>

                <input
                  type="text"
                  placeholder="Paste raw GitHub image link here"
                  value={newImage}
                  onChange={event =>
                    setNewImage(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              {/* ==============================================
                  FLOWER PICKER IN ADD PRODUCT
              ============================================== */}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Add Flowers & Quantities
                </label>

                <div
                  className="flex gap-2 mb-3 relative"
                  ref={modalPickerRef}
                >
                  <div className="relative flex-1">
                    <div
                      onClick={() =>
                        setIsModalPickerOpen(
                          !isModalPickerOpen
                        )
                      }
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm cursor-pointer ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedModalFlower ? (
                          <>
                            <img
                              src={
                                selectedModalFlower.image
                              }
                              alt=""
                              className="w-6 h-6 rounded-lg object-cover"
                            />

                            <span className="font-medium">
                              {
                                selectedModalFlower.name
                              }
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">
                            Select a flower from database...
                          </span>
                        )}
                      </div>

                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>

                    {isModalPickerOpen && (
                      <div
                        className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl z-30 p-3 ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div
                          className={`flex items-center px-3 py-2 rounded-xl border mb-3 ${
                            darkMode
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <Search className="w-4 h-4 text-slate-400 mr-2" />

                          <input
                            type="text"
                            placeholder="Type to search flower..."
                            value={
                              modalPickerSearch
                            }
                            onChange={event =>
                              setModalPickerSearch(
                                event
                                  .target
                                  .value
                              )
                            }
                            autoFocus
                            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          {modalSearchableFlowers.map(
                            flower => (
                              <div
                                key={
                                  flower.id
                                }
                                onClick={() => {
                                  setSelectedModalFlower(
                                    flower
                                  );

                                  setIsModalPickerOpen(
                                    false
                                  );

                                  setModalPickerSearch(
                                    ''
                                  );
                                }}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                                  selectedModalFlower?.id ===
                                  flower.id
                                    ? 'bg-slate-500/20 border border-slate-400/40'
                                    : darkMode
                                      ? 'hover:bg-slate-800'
                                      : 'hover:bg-slate-100'
                                }`}
                              >
                                <img
                                  src={
                                    flower.image
                                  }
                                  alt={
                                    flower.name
                                  }
                                  className="w-8 h-8 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                                />

                                <span className="text-xs font-bold leading-tight">
                                  {
                                    flower.name
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={
                      modalFlowerCount
                    }
                    onChange={event =>
                      setModalFlowerCount(
                        event.target.value
                      )
                    }
                    className={`w-20 px-3 py-2.5 rounded-xl border text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    } outline-none shadow-sm`}
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddFlowerToModal
                    }
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {newModalFlowersList.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.name}-${index}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${
                          darkMode
                            ? 'bg-slate-800/40 border-slate-700'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.image
                            }
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />

                          <span className="text-xs font-bold">
                            {item.name}{' '}
                            (Qty:{' '}
                            {item.count})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveModalFlower(
                              index
                            )
                          }
                          className="text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddingModal(
                      false
                    )
                  }
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD FLOWER MODAL
      ====================================================== */}

      {isAddingFlowerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            } border rounded-3xl max-w-md w-full p-6 shadow-2xl`}
          >
            <h3 className="text-lg font-bold mb-4">
              Add Flower to Database
            </h3>

            <form
              onSubmit={
                handleAddMasterFlower
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Flower Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Poppy - Blue"
                  value={
                    newFlowerDbName
                  }
                  onChange={event =>
                    setNewFlowerDbName(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Image URL
                </label>

                <input
                  type="text"
                  placeholder="e.g. https://raw.githubusercontent.com/.../poppyblue.png"
                  value={
                    newFlowerDbImage
                  }
                  onChange={event =>
                    setNewFlowerDbImage(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddingFlowerModal(
                      false
                    )
                  }
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                >
                  Save Flower
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD ARRANGEMENT MODAL
      ====================================================== */}

      {isAddingArrangementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            } border rounded-3xl max-w-md w-full p-6 shadow-2xl`}
          >
            <h3 className="text-lg font-bold mb-4">
              Add New Arrangement
            </h3>

            <form
              onSubmit={
                handleAddArrangement
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Arrangement Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Zekreet"
                  value={
                    newArrangementName
                  }
                  onChange={event =>
                    setNewArrangementName(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Price (QAR)
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. 810 QAR"
                  value={
                    newArrangementPrice
                  }
                  onChange={event =>
                    setNewArrangementPrice(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Image URL (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. https://raw.githubusercontent.com/.../Zekreet.png"
                  value={
                    newArrangementImage
                  }
                  onChange={event =>
                    setNewArrangementImage(
                      event.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddingArrangementModal(
                      false
                    )
                  }
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md"
                >
                  Save Arrangement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RENDER APP
============================================================ */

ReactDOM.createRoot(
  document.getElementById('app')
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
