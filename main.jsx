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
  Pencil,
} from 'lucide-react';

import {
  INITIAL_PRODUCTS,
  INITIAL_FLOWERS,
  INITIAL_ARRANGEMENTS,
} from './data';

import { supabase } from './supabase';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  const [products, setProducts] = useState([]);
  const [masterFlowers, setMasterFlowers] = useState([]);
  const [arrangements, setArrangements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState('');

  const [isAddingModal, setIsAddingModal] = useState(false);
  const [isAddingFlowerModal, setIsAddingFlowerModal] = useState(false);
  const [isAddingArrangementModal, setIsAddingArrangementModal] = useState(false);

  // NEW: Edit flower modal
  const [editingFlower, setEditingFlower] = useState(null);
  const [editFlowerName, setEditFlowerName] = useState('');
  const [editFlowerImage, setEditFlowerImage] = useState('');
  const [savingFlowerEdit, setSavingFlowerEdit] = useState(false);

  const [isFlowerPickerOpen, setIsFlowerPickerOpen] = useState(false);
  const [flowerPickerSearch, setFlowerPickerSearch] = useState('');
  const [selectedMasterFlower, setSelectedMasterFlower] = useState(null);
  const [recipeFlowerCount, setRecipeFlowerCount] = useState(1);
  const pickerRef = useRef(null);

  const [isModalPickerOpen, setIsModalPickerOpen] = useState(false);
  const [modalPickerSearch, setModalPickerSearch] = useState('');
  const [selectedModalFlower, setSelectedModalFlower] = useState(null);
  const [modalFlowerCount, setModalFlowerCount] = useState(1);
  const [newModalFlowersList, setNewModalFlowersList] = useState([]);
  const modalPickerRef = useRef(null);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('ready-bouquets');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');

  const [newFlowerDbName, setNewFlowerDbName] = useState('');
  const [newFlowerDbImage, setNewFlowerDbImage] = useState('');

  const [newArrangementName, setNewArrangementName] = useState('');
  const [newArrangementPrice, setNewArrangementPrice] = useState('');
  const [newArrangementImage, setNewArrangementImage] = useState('');

  useEffect(() => {
    loadDatabase();
  }, []);

  async function loadDatabase() {
    setLoading(true);
    setDatabaseError('');

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*');

      if (productError) throw productError;

      let loadedProducts = productData || [];
      if (loadedProducts.length === 0) {
        const { error } = await supabase
          .from('products')
          .upsert(INITIAL_PRODUCTS, { onConflict: 'id' });
        if (error) throw error;
        loadedProducts = INITIAL_PRODUCTS;
      }

      const { data: flowerData, error: flowerError } = await supabase
        .from('flowers')
        .select('*');

      if (flowerError) throw flowerError;

      let loadedFlowers = flowerData || [];
      if (loadedFlowers.length === 0) {
        const { error } = await supabase
          .from('flowers')
          .upsert(INITIAL_FLOWERS, { onConflict: 'id' });
        if (error) throw error;
        loadedFlowers = INITIAL_FLOWERS;
      }

      const { data: arrangementData, error: arrangementError } = await supabase
        .from('arrangements')
        .select('*');

      if (arrangementError) throw arrangementError;

      let loadedArrangements = arrangementData || [];
      if (loadedArrangements.length === 0) {
        const { error } = await supabase
          .from('arrangements')
          .upsert(INITIAL_ARRANGEMENTS, { onConflict: 'id' });
        if (error) throw error;
        loadedArrangements = INITIAL_ARRANGEMENTS;
      }

      setProducts(loadedProducts);
      setMasterFlowers(loadedFlowers);
      setArrangements(loadedArrangements);
    } catch (error) {
      console.error('Supabase loading error:', error);
      setDatabaseError(error?.message || 'Unable to connect to the database.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedProduct) return;

    const latestProduct = products.find(
      product => product.id === selectedProduct.id
    );

    if (latestProduct) {
      setSelectedProduct(latestProduct);
    } else {
      setSelectedProduct(null);
    }
  }, [products]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setIsFlowerPickerOpen(false);
      }

      if (
        modalPickerRef.current &&
        !modalPickerRef.current.contains(event.target)
      ) {
        setIsModalPickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getFlowerImage(flower) {
    if (flower?.image && typeof flower.image === 'string') {
      return flower.image;
    }

    if (!flower?.name) return '';

    const exactMatch = masterFlowers.find(
      masterFlower =>
        masterFlower.name.trim().toLowerCase() ===
        flower.name.trim().toLowerCase()
    );

    return exactMatch?.image || '';
  }

  async function handleAddProduct(event) {
    event.preventDefault();

    if (!newName || !newPrice) return;

    setDatabaseError('');

    const newProduct = {
      id: `product-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: newPrice.toUpperCase().includes('QAR')
        ? newPrice.trim()
        : `${newPrice.trim()} QAR`,
      image:
        newImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/1001nights.png',
      flowers: newModalFlowersList,
    };

    const { error } = await supabase.from('products').insert(newProduct);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not save bouquet: ${error.message}`);
      return;
    }

    setProducts(previous => [newProduct, ...previous]);
    setNewName('');
    setNewPrice('');
    setNewImage('');
    setNewModalFlowersList([]);
    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');
    setIsAddingModal(false);
  }

  function handleAddFlowerToModal(event) {
    event.preventDefault();

    if (!selectedModalFlower) return;

    const newFlowerItem = {
      name: selectedModalFlower.name,
      count: parseInt(modalFlowerCount, 10) || 1,
      image: selectedModalFlower.image,
    };

    setNewModalFlowersList(previous => [...previous, newFlowerItem]);
    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');
  }

  function handleRemoveModalFlower(index) {
    setNewModalFlowersList(previous =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function handleAddMasterFlower(event) {
    event.preventDefault();

    if (!newFlowerDbName.trim()) return;

    setDatabaseError('');

    const newFlower = {
      id: `flower-${Date.now()}`,
      name: newFlowerDbName.trim(),
      image:
        newFlowerDbImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/botanicalleaf.png',
    };

    const { error } = await supabase.from('flowers').insert(newFlower);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not save flower: ${error.message}`);
      return;
    }

    setMasterFlowers(previous => [newFlower, ...previous]);
    setNewFlowerDbName('');
    setNewFlowerDbImage('');
    setIsAddingFlowerModal(false);
  }

  // ============================================================
  // EDIT MASTER FLOWER
  // Updates the master flower AND every bouquet that currently
  // references the old flower name.
  // ============================================================

  function openEditFlower(flower, event) {
    event?.stopPropagation();

    setEditingFlower(flower);
    setEditFlowerName(flower.name || '');
    setEditFlowerImage(flower.image || '');
    setDatabaseError('');
  }

  function closeEditFlower() {
    if (savingFlowerEdit) return;

    setEditingFlower(null);
    setEditFlowerName('');
    setEditFlowerImage('');
  }

  async function handleEditMasterFlower(event) {
    event.preventDefault();

    if (!editingFlower || !editFlowerName.trim()) return;

    const oldName = editingFlower.name;
    const updatedFlower = {
      ...editingFlower,
      name: editFlowerName.trim(),
      image: editFlowerImage.trim(),
    };

    setSavingFlowerEdit(true);
    setDatabaseError('');

    try {
      // 1. Update master flower row.
      const { error: flowerError } = await supabase
        .from('flowers')
        .update({
          name: updatedFlower.name,
          image: updatedFlower.image,
        })
        .eq('id', editingFlower.id);

      if (flowerError) throw flowerError;

      // 2. Update every existing bouquet recipe that contains this flower.
      const affectedProducts = products
        .filter(product =>
          (product.flowers || []).some(
            flower =>
              (flower.name || '').trim().toLowerCase() ===
              (oldName || '').trim().toLowerCase()
          )
        )
        .map(product => ({
          ...product,
          flowers: (product.flowers || []).map(flower => {
            const isMatch =
              (flower.name || '').trim().toLowerCase() ===
              (oldName || '').trim().toLowerCase();

            if (!isMatch) return flower;

            return {
              ...flower,
              name: updatedFlower.name,
              image: updatedFlower.image,
            };
          }),
        }));

      if (affectedProducts.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .upsert(affectedProducts, { onConflict: 'id' });

        if (productsError) {
          // Roll master flower back so the database is not left inconsistent.
          const { error: rollbackError } = await supabase
            .from('flowers')
            .update({
              name: editingFlower.name,
              image: editingFlower.image,
            })
            .eq('id', editingFlower.id);

          if (rollbackError) {
            console.error('Rollback failed:', rollbackError);
          }

          throw productsError;
        }
      }

      // 3. Update app state only after Supabase succeeds.
      setMasterFlowers(previous =>
        previous.map(flower =>
          flower.id === editingFlower.id ? updatedFlower : flower
        )
      );

      if (affectedProducts.length > 0) {
        const affectedById = new Map(
          affectedProducts.map(product => [product.id, product])
        );

        setProducts(previous =>
          previous.map(product => affectedById.get(product.id) || product)
        );
      }

      // Keep currently selected picker values synced if they reference this flower.
      if (selectedMasterFlower?.id === editingFlower.id) {
        setSelectedMasterFlower(updatedFlower);
      }

      if (selectedModalFlower?.id === editingFlower.id) {
        setSelectedModalFlower(updatedFlower);
      }

      setNewModalFlowersList(previous =>
        previous.map(flower => {
          const isMatch =
            (flower.name || '').trim().toLowerCase() ===
            (oldName || '').trim().toLowerCase();

          return isMatch
            ? {
                ...flower,
                name: updatedFlower.name,
                image: updatedFlower.image,
              }
            : flower;
        })
      );

      setEditingFlower(null);
      setEditFlowerName('');
      setEditFlowerImage('');
    } catch (error) {
      console.error('Could not edit flower:', error);
      setDatabaseError(
        `Could not edit flower: ${error?.message || 'Unknown error'}`
      );
    } finally {
      setSavingFlowerEdit(false);
    }
  }

  async function handleAddArrangement(event) {
    event.preventDefault();

    if (
      !newArrangementName.trim() ||
      !newArrangementPrice.trim()
    ) {
      return;
    }

    setDatabaseError('');
    const arrangementName = newArrangementName.trim();

    const newArrangement = {
      id: `arrangement-${Date.now()}`,
      name: arrangementName,
      price: newArrangementPrice.toUpperCase().includes('QAR')
        ? newArrangementPrice.trim()
        : `${newArrangementPrice.trim()} QAR`,
      image:
        newArrangementImage.trim() ||
        `https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/${arrangementName}.png`,
    };

    const { error } = await supabase
      .from('arrangements')
      .insert(newArrangement);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not save arrangement: ${error.message}`);
      return;
    }

    setArrangements(previous => [newArrangement, ...previous]);
    setNewArrangementName('');
    setNewArrangementPrice('');
    setNewArrangementImage('');
    setIsAddingArrangementModal(false);
  }

  async function handleDeleteMasterFlower(id, event) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this flower from the database?'
    );

    if (!confirmed) return;

    setDatabaseError('');

    const { error } = await supabase
      .from('flowers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not delete flower: ${error.message}`);
      return;
    }

    setMasterFlowers(previous =>
      previous.filter(flower => flower.id !== id)
    );
  }

  async function handleDeleteArrangement(id, event) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this arrangement?'
    );

    if (!confirmed) return;

    setDatabaseError('');

    const { error } = await supabase
      .from('arrangements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not delete arrangement: ${error.message}`);
      return;
    }

    setArrangements(previous =>
      previous.filter(arrangement => arrangement.id !== id)
    );
  }

  async function handleDeleteProduct(id, event) {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this bouquet?'
    );

    if (!confirmed) return;

    setDatabaseError('');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not delete bouquet: ${error.message}`);
      return;
    }

    setProducts(previous =>
      previous.filter(product => product.id !== id)
    );

    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
  }

  async function handleAddFlowerToProduct(event) {
    event.preventDefault();

    if (!selectedMasterFlower || !selectedProduct) return;

    setDatabaseError('');

    const flowerToAdd = {
      name: selectedMasterFlower.name,
      count: parseInt(recipeFlowerCount, 10) || 1,
      image: selectedMasterFlower.image,
    };

    const updatedFlowers = [
      ...(selectedProduct.flowers || []),
      flowerToAdd,
    ];

    const { error } = await supabase
      .from('products')
      .update({ flowers: updatedFlowers })
      .eq('id', selectedProduct.id);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not update bouquet: ${error.message}`);
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };

    setProducts(previous =>
      previous.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );

    setSelectedMasterFlower(null);
    setRecipeFlowerCount(1);
    setFlowerPickerSearch('');
  }

  async function handleRemoveFlower(flowerIndex) {
    if (!selectedProduct) return;

    setDatabaseError('');

    const updatedFlowers = (selectedProduct.flowers || []).filter(
      (_, index) => index !== flowerIndex
    );

    const { error } = await supabase
      .from('products')
      .update({ flowers: updatedFlowers })
      .eq('id', selectedProduct.id);

    if (error) {
      console.error(error);
      setDatabaseError(`Could not update bouquet: ${error.message}`);
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };

    setProducts(previous =>
      previous.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesTab =
      activeTab === 'all' || product.category === activeTab;

    const matchesSearch = (product.name || '')
      .toLowerCase()
      .includes(normalizedSearch);

    return matchesTab && matchesSearch;
  });

  const filteredMasterFlowers = masterFlowers.filter(flower =>
    (flower.name || '').toLowerCase().includes(normalizedSearch)
  );

  const filteredArrangements = arrangements.filter(arrangement =>
    (arrangement.name || '').toLowerCase().includes(normalizedSearch)
  );

  const searchablePickerFlowers = masterFlowers.filter(flower =>
    (flower.name || '')
      .toLowerCase()
      .includes(flowerPickerSearch.toLowerCase())
  );

  const modalSearchableFlowers = masterFlowers.filter(flower =>
    (flower.name || '')
      .toLowerCase()
      .includes(modalPickerSearch.toLowerCase())
  );

  function FlowerImage({ flower, className = '' }) {
    const [failed, setFailed] = useState(false);
    const image = getFlowerImage(flower);

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
        onError={() => setFailed(true)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin mx-auto mb-5" />
          <h2 className="font-bold text-lg text-slate-800">
            The Crochet Garden
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Loading catalogue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode
          ? 'dark bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      } min-h-screen font-sans transition-colors duration-300 flex`}
    >
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64 p-6' : 'w-20 p-4'
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
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl border ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              } hover:opacity-80 transition-all ${
                sidebarOpen ? '' : 'hidden'
              }`}
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {!sidebarOpen && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSidebarOpen(true)}
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
              { id: 'all', label: 'All Products', icon: Package },
              { id: 'single-flowers', label: 'Single Flowers', icon: Flower2 },
              { id: 'ready-bouquets', label: 'Ready Bouquets', icon: Gift },
              { id: 'arrangements', label: 'Arrangements', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive =
                activeTab === tab.id && !selectedProduct;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedProduct(null);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-500/20 to-slate-600/30 text-slate-900 dark:text-white border border-slate-400/30 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                  title={!sidebarOpen ? tab.label : ''}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div
            className={`p-3 rounded-2xl ${
              darkMode ? 'bg-slate-800/50' : 'bg-slate-100'
            } flex items-center justify-between`}
          >
            {sidebarOpen && (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dark Mode
              </span>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors mx-auto ${
                darkMode ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {databaseError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-red-700 text-sm">
                Database error
              </p>
              <p className="text-red-600 text-xs mt-1">
                {databaseError}
              </p>
            </div>

            <button
              onClick={() => setDatabaseError('')}
              className="text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectedProduct && (
          <button
            onClick={() => setSelectedProduct(null)}
            className={`fixed top-8 ${
              sidebarOpen ? 'left-72' : 'left-24'
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

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedProduct
                ? 'Order Breakdown'
                : activeTab === 'single-flowers'
                  ? 'Single Flowers Database'
                  : activeTab === 'arrangements'
                    ? 'Arrangements Collection'
                    : 'Product Dashboard'}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {selectedProduct
                ? 'Verify items needed instantly for your Snoonu order.'
                : activeTab === 'single-flowers'
                  ? 'Master inventory of all individual flowers used across bouquets.'
                  : activeTab === 'arrangements'
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
                  activeTab === 'single-flowers'
                    ? 'Search flowers...'
                    : activeTab === 'arrangements'
                      ? 'Search arrangements...'
                      : 'Search bouquets...'
                }
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              />
            </div>

            {!selectedProduct && activeTab === 'ready-bouquets' && (
              <button
                onClick={() => setIsAddingModal(true)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                title="Add New Bouquet"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {!selectedProduct && activeTab === 'single-flowers' && (
              <button
                onClick={() => setIsAddingFlowerModal(true)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                title="Add Flower to DB"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {!selectedProduct && activeTab === 'arrangements' && (
              <button
                onClick={() => setIsAddingArrangementModal(true)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all shrink-0"
                title="Add Arrangement"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* SINGLE FLOWERS */}
        {activeTab === 'single-flowers' && !selectedProduct ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMasterFlowers.map(flower => (
                <div
                  key={flower.id}
                  className={`group relative ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  } border rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center`}
                >
                  {/* NEW: Edit button */}
                  <button
                    onClick={event => openEditFlower(flower, event)}
                    className="absolute top-2 left-2 bg-slate-800/95 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 hover:scale-105"
                    title="Edit flower"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={event =>
                      handleDeleteMasterFlower(flower.id, event)
                    }
                    className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    title="Delete flower from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 shadow-inner cursor-pointer"
                    onClick={() => setZoomedImage(flower.image)}
                  >
                    <img
                      src={flower.image}
                      alt={flower.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <h4 className="font-bold text-sm">{flower.name}</h4>
                </div>
              ))}
            </div>

            {filteredMasterFlowers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No flowers found in database.
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'arrangements' && !selectedProduct ? (
          /* ARRANGEMENTS */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArrangements.map(arrangement => (
                <div
                  key={arrangement.id}
                  className={`group relative ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  } border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center`}
                >
                  <button
                    onClick={event =>
                      handleDeleteArrangement(arrangement.id, event)
                    }
                    className="absolute top-3 right-3 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    title="Delete arrangement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div
                    className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 shadow-inner cursor-pointer"
                    onClick={() => setZoomedImage(arrangement.image)}
                  >
                    <img
                      src={arrangement.image}
                      alt={arrangement.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h4 className="font-bold text-base mb-1">
                    {arrangement.name}
                  </h4>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {arrangement.price}
                  </span>
                </div>
              ))}
            </div>

            {filteredArrangements.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No arrangements found matching search.
                </p>
              </div>
            )}
          </div>
        ) : selectedProduct ? (
          /* PRODUCT DETAIL */
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
                  onClick={() => setZoomedImage(selectedProduct.image)}
                >
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-3">
                  {selectedProduct.price}
                </span>

                <h3 className="text-xl font-bold mb-2">
                  {selectedProduct.name}
                </h3>
              </div>

              <div
                className={`lg:col-span-2 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                } border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between`}
              >
                <div>
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

                  <form
                    onSubmit={handleAddFlowerToProduct}
                    className="flex gap-2 mb-6 relative"
                  >
                    <div className="relative flex-1" ref={pickerRef}>
                      <div
                        onClick={() =>
                          setIsFlowerPickerOpen(!isFlowerPickerOpen)
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
                                src={selectedMasterFlower.image}
                                alt=""
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                              <span className="font-medium">
                                {selectedMasterFlower.name}
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
                              value={flowerPickerSearch}
                              onChange={event =>
                                setFlowerPickerSearch(event.target.value)
                              }
                              autoFocus
                              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400"
                            />
                          </div>

                          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                            {searchablePickerFlowers.map(flower => (
                              <div
                                key={flower.id}
                                onClick={() => {
                                  setSelectedMasterFlower(flower);
                                  setIsFlowerPickerOpen(false);
                                  setFlowerPickerSearch('');
                                }}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                                  selectedMasterFlower?.id === flower.id
                                    ? 'bg-slate-500/20 border border-slate-400/40'
                                    : darkMode
                                      ? 'hover:bg-slate-800'
                                      : 'hover:bg-slate-100'
                                }`}
                              >
                                <img
                                  src={flower.image}
                                  alt={flower.name}
                                  className="w-9 h-9 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                                />
                                <span className="text-xs font-bold leading-tight">
                                  {flower.name}
                                </span>
                              </div>
                            ))}

                            {searchablePickerFlowers.length === 0 && (
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
                      value={recipeFlowerCount}
                      onChange={event =>
                        setRecipeFlowerCount(event.target.value)
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedProduct.flowers || []).map((flower, index) => {
                      const resolvedImage = getFlowerImage(flower);

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
                            onClick={() => handleRemoveFlower(index)}
                            className="absolute top-2.5 right-2.5 bg-slate-900 dark:bg-slate-700 text-white p-1.5 rounded-full hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md"
                            title="Remove flower"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-4 pr-6">
                            <div
                              className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md shrink-0 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                              onClick={() => {
                                if (resolvedImage) {
                                  setZoomedImage(resolvedImage);
                                }
                              }}
                            >
                              <FlowerImage
                                flower={flower}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>

                            <div>
                              <h5 className="font-bold text-sm leading-tight mb-1">
                                {flower.name}
                              </h5>
                              <span className="text-xs text-slate-400 font-medium">
                                Qty: {flower.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`group cursor-pointer ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  } border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative`}
                >
                  <button
                    onClick={event =>
                      handleDeleteProduct(product.id, event)
                    }
                    className="absolute top-3 left-3 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                        {product.price}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-base mb-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`px-5 py-4 border-t ${
                      darkMode ? 'border-slate-800/80' : 'border-slate-100'
                    } flex items-center justify-between`}
                  >
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Flower2 className="w-3.5 h-3.5 text-slate-500" />
                      {(product.flowers || []).length} flower types
                    </span>

                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">
                  No products found matching your search.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* IMAGE ZOOM */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={event => event.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
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

      {/* ADD PRODUCT MODAL */}
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

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Damascus Rose"
                  value={newName}
                  onChange={event => setNewName(event.target.value)}
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
                  onChange={event => setNewCategory(event.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                >
                  <option value="ready-bouquets">Ready Bouquets</option>
                  <option value="arrangements">Arrangements</option>
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
                  onChange={event => setNewPrice(event.target.value)}
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
                  onChange={event => setNewImage(event.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Add Flowers & Quantities
                </label>

                <div className="flex gap-2 mb-3 relative" ref={modalPickerRef}>
                  <div className="relative flex-1">
                    <div
                      onClick={() =>
                        setIsModalPickerOpen(!isModalPickerOpen)
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
                              src={selectedModalFlower.image}
                              alt=""
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                            <span className="font-medium">
                              {selectedModalFlower.name}
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
                            value={modalPickerSearch}
                            onChange={event =>
                              setModalPickerSearch(event.target.value)
                            }
                            autoFocus
                            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          {modalSearchableFlowers.map(flower => (
                            <div
                              key={flower.id}
                              onClick={() => {
                                setSelectedModalFlower(flower);
                                setIsModalPickerOpen(false);
                                setModalPickerSearch('');
                              }}
                              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                                selectedModalFlower?.id === flower.id
                                  ? 'bg-slate-500/20 border border-slate-400/40'
                                  : darkMode
                                    ? 'hover:bg-slate-800'
                                    : 'hover:bg-slate-100'
                              }`}
                            >
                              <img
                                src={flower.image}
                                alt={flower.name}
                                className="w-8 h-8 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                              />
                              <span className="text-xs font-bold leading-tight">
                                {flower.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={modalFlowerCount}
                    onChange={event =>
                      setModalFlowerCount(event.target.value)
                    }
                    className={`w-20 px-3 py-2.5 rounded-xl border text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    } outline-none shadow-sm`}
                  />

                  <button
                    type="button"
                    onClick={handleAddFlowerToModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {newModalFlowersList.map((item, index) => (
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
                          src={item.image}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-xs font-bold">
                          {item.name} (Qty: {item.count})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveModalFlower(index)}
                        className="text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
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

      {/* ADD FLOWER MODAL */}
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

            <form onSubmit={handleAddMasterFlower} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Flower Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Poppy - Blue"
                  value={newFlowerDbName}
                  onChange={event =>
                    setNewFlowerDbName(event.target.value)
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
                  value={newFlowerDbImage}
                  onChange={event =>
                    setNewFlowerDbImage(event.target.value)
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
                  onClick={() => setIsAddingFlowerModal(false)}
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

      {/* NEW: EDIT FLOWER MODAL */}
      {editingFlower && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={closeEditFlower}
        >
          <div
            onClick={event => event.stopPropagation()}
            className={`${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            } border rounded-[28px] max-w-md w-full p-6 shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Pencil className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-lg font-bold">
                  Edit Flower
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Changes will also update this flower inside existing bouquets.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditFlower}
                disabled={savingFlowerEdit}
                className={`p-2 rounded-xl ${
                  darkMode
                    ? 'hover:bg-slate-800 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-400'
                } transition-colors`}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleEditMasterFlower}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Flower Name
                </label>
                <input
                  type="text"
                  required
                  value={editFlowerName}
                  onChange={event =>
                    setEditFlowerName(event.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  } outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editFlowerImage}
                  onChange={event =>
                    setEditFlowerImage(event.target.value)
                  }
                  placeholder="Paste raw GitHub image URL"
                  className={`w-full px-4 py-3 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  } outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all`}
                />
              </div>

              {editFlowerImage.trim() && (
                <div
                  className={`rounded-2xl border p-3 ${
                    darkMode
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Preview
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <img
                        src={editFlowerImage}
                        alt="Flower preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {editFlowerName || editingFlower.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Preview of the updated flower
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeEditFlower}
                  disabled={savingFlowerEdit}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingFlowerEdit || !editFlowerName.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingFlowerEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ARRANGEMENT MODAL */}
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
              onSubmit={handleAddArrangement}
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
                  value={newArrangementName}
                  onChange={event =>
                    setNewArrangementName(event.target.value)
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
                  value={newArrangementPrice}
                  onChange={event =>
                    setNewArrangementPrice(event.target.value)
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
                  value={newArrangementImage}
                  onChange={event =>
                    setNewArrangementImage(event.target.value)
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
                  onClick={() => setIsAddingArrangementModal(false)}
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

ReactDOM.createRoot(
  document.getElementById('app')
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
