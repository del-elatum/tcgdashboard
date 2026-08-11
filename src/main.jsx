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


/* ============================================================
   APP
============================================================ */

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

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingFlower, setIsAddingFlower] = useState(false);
  const [isAddingArrangement, setIsAddingArrangement] = useState(false);

  const [editingFlower, setEditingFlower] = useState(null);
  const [editFlowerName, setEditFlowerName] = useState('');
  const [editFlowerImage, setEditFlowerImage] = useState('');
  const [savingFlowerEdit, setSavingFlowerEdit] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductImage, setEditProductImage] = useState('');
  const [editProductFlowers, setEditProductFlowers] = useState([]);
  const [savingProductEdit, setSavingProductEdit] = useState(false);

  const [isEditProductPickerOpen, setIsEditProductPickerOpen] =
    useState(false);

  const [editProductPickerSearch, setEditProductPickerSearch] =
    useState('');

  const [selectedEditProductFlower, setSelectedEditProductFlower] =
    useState(null);

  const [editProductFlowerCount, setEditProductFlowerCount] =
    useState(1);

  const editProductPickerRef = useRef(null);

  const [editingArrangement, setEditingArrangement] = useState(null);
  const [editArrangementName, setEditArrangementName] = useState('');
  const [editArrangementPrice, setEditArrangementPrice] = useState('');
  const [editArrangementImage, setEditArrangementImage] = useState('');
  const [savingArrangementEdit, setSavingArrangementEdit] =
    useState(false);

  const [editingQuantityIndex, setEditingQuantityIndex] = useState(null);
  const [quantityDraft, setQuantityDraft] = useState('');
  const [savingQuantity, setSavingQuantity] = useState(false);

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

  const [newFlowerName, setNewFlowerName] = useState('');
  const [newFlowerImage, setNewFlowerImage] = useState('');

  const [newArrangementName, setNewArrangementName] = useState('');
  const [newArrangementPrice, setNewArrangementPrice] = useState('');
  const [newArrangementImage, setNewArrangementImage] = useState('');


  /* ============================================================
     LOAD DATABASE
  ============================================================ */

  useEffect(() => {
    loadDatabase();
  }, []);


  async function loadDatabase() {
    setLoading(true);
    setDatabaseError('');

    try {
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from('products')
        .select('*');

      if (productError) {
        throw productError;
      }

      let loadedProducts = productData || [];

      if (loadedProducts.length === 0) {
        const {
          error: seedProductError,
        } = await supabase
          .from('products')
          .upsert(
            INITIAL_PRODUCTS,
            {
              onConflict: 'id',
            }
          );

        if (seedProductError) {
          throw seedProductError;
        }

        loadedProducts = INITIAL_PRODUCTS;
      }


      const {
        data: flowerData,
        error: flowerError,
      } = await supabase
        .from('flowers')
        .select('*');

      if (flowerError) {
        throw flowerError;
      }

      let loadedFlowers = flowerData || [];

      if (loadedFlowers.length === 0) {
        const {
          error: seedFlowerError,
        } = await supabase
          .from('flowers')
          .upsert(
            INITIAL_FLOWERS,
            {
              onConflict: 'id',
            }
          );

        if (seedFlowerError) {
          throw seedFlowerError;
        }

        loadedFlowers = INITIAL_FLOWERS;
      }


      const {
        data: arrangementData,
        error: arrangementError,
      } = await supabase
        .from('arrangements')
        .select('*');

      if (arrangementError) {
        throw arrangementError;
      }

      let loadedArrangements = arrangementData || [];

      if (loadedArrangements.length === 0) {
        const {
          error: seedArrangementError,
        } = await supabase
          .from('arrangements')
          .upsert(
            INITIAL_ARRANGEMENTS,
            {
              onConflict: 'id',
            }
          );

        if (seedArrangementError) {
          throw seedArrangementError;
        }

        loadedArrangements = INITIAL_ARRANGEMENTS;
      }


      setProducts(loadedProducts);
      setMasterFlowers(loadedFlowers);
      setArrangements(loadedArrangements);
    } catch (error) {
      console.error(
        'Database loading error:',
        error
      );

      setDatabaseError(
        error?.message ||
          'Unable to load database.'
      );
    } finally {
      setLoading(false);
    }
  }


  /* ============================================================
     KEEP SELECTED PRODUCT UPDATED
  ============================================================ */

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const latest = products.find(
      product =>
        product.id === selectedProduct.id
    );

    if (latest) {
      setSelectedProduct(latest);
    }
  }, [products]);


  /* ============================================================
     CLOSE DROPDOWNS
  ============================================================ */

  useEffect(() => {
    function handleOutsideClick(event) {
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

      if (
        editProductPickerRef.current &&
        !editProductPickerRef.current.contains(event.target)
      ) {
        setIsEditProductPickerOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
  }, []);


  /* ============================================================
     HELPERS
  ============================================================ */

  function getFlowerImage(flower) {
    if (
      flower?.image &&
      typeof flower.image === 'string'
    ) {
      return flower.image;
    }

    if (!flower?.name) {
      return '';
    }

    const match = masterFlowers.find(
      masterFlower =>
        masterFlower.name
          .trim()
          .toLowerCase() ===
        flower.name
          .trim()
          .toLowerCase()
    );

    return match?.image || '';
  }


  function formatPrice(price) {
    const value = String(price || '').trim();

    if (!value) {
      return '';
    }

    return value
      .toUpperCase()
      .includes('QAR')
      ? value
      : `${value} QAR`;
  }


  /* ============================================================
     ADD PRODUCT
  ============================================================ */

  async function handleAddProduct(event) {
    event.preventDefault();

    if (
      !newName.trim() ||
      !newPrice.trim()
    ) {
      return;
    }

    const product = {
      id: `product-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: formatPrice(newPrice),

      image:
        newImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/1001nights.png',

      flowers: newModalFlowersList,
    };


    const {
      error,
    } = await supabase
      .from('products')
      .insert(product);


    if (error) {
      setDatabaseError(
        `Could not save product: ${error.message}`
      );

      return;
    }


    setProducts(
      previous => [
        product,
        ...previous,
      ]
    );


    setNewName('');
    setNewPrice('');
    setNewImage('');
    setNewModalFlowersList([]);
    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');
    setIsAddingProduct(false);
  }


  function handleAddModalFlower() {
    if (!selectedModalFlower) {
      return;
    }

    const item = {
      name: selectedModalFlower.name,
      image: selectedModalFlower.image,

      count:
        parseInt(
          modalFlowerCount,
          10
        ) || 1,
    };


    setNewModalFlowersList(
      previous => [
        ...previous,
        item,
      ]
    );


    setSelectedModalFlower(null);
    setModalFlowerCount(1);
    setModalPickerSearch('');
  }


  function removeModalFlower(index) {
    setNewModalFlowersList(
      previous =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );
  }


  /* ============================================================
     ADD FLOWER
  ============================================================ */

  async function handleAddFlower(event) {
    event.preventDefault();

    if (!newFlowerName.trim()) {
      return;
    }

    const flower = {
      id: `flower-${Date.now()}`,
      name: newFlowerName.trim(),

      image:
        newFlowerImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/botanicalleaf.png',
    };


    const {
      error,
    } = await supabase
      .from('flowers')
      .insert(flower);


    if (error) {
      setDatabaseError(
        `Could not save flower: ${error.message}`
      );

      return;
    }


    setMasterFlowers(
      previous => [
        flower,
        ...previous,
      ]
    );


    setNewFlowerName('');
    setNewFlowerImage('');
    setIsAddingFlower(false);
  }


  /* ============================================================
     EDIT FLOWER
  ============================================================ */

  function openEditFlower(
    flower,
    event
  ) {
    event?.stopPropagation();

    setEditingFlower(flower);
    setEditFlowerName(flower.name || '');
    setEditFlowerImage(flower.image || '');
  }


  function closeEditFlower() {
    if (savingFlowerEdit) {
      return;
    }

    setEditingFlower(null);
    setEditFlowerName('');
    setEditFlowerImage('');
  }


  async function handleSaveFlowerEdit(event) {
    event.preventDefault();

    if (
      !editingFlower ||
      !editFlowerName.trim()
    ) {
      return;
    }

    setSavingFlowerEdit(true);
    setDatabaseError('');

    const oldName = editingFlower.name;

    const updatedFlower = {
      ...editingFlower,
      name: editFlowerName.trim(),
      image: editFlowerImage.trim(),
    };


    try {
      const {
        error: flowerError,
      } = await supabase
        .from('flowers')
        .update({
          name: updatedFlower.name,
          image: updatedFlower.image,
        })
        .eq(
          'id',
          editingFlower.id
        );


      if (flowerError) {
        throw flowerError;
      }


      const affectedProducts =
        products
          .filter(product =>
            (
              product.flowers ||
              []
            ).some(
              flower =>
                (
                  flower.name ||
                  ''
                )
                  .trim()
                  .toLowerCase() ===
                (
                  oldName || ''
                )
                  .trim()
                  .toLowerCase()
            )
          )
          .map(product => ({
            ...product,

            flowers:
              (
                product.flowers ||
                []
              ).map(
                flower => {
                  const matches =
                    (
                      flower.name ||
                      ''
                    )
                      .trim()
                      .toLowerCase() ===
                    (
                      oldName ||
                      ''
                    )
                      .trim()
                      .toLowerCase();


                  if (!matches) {
                    return flower;
                  }


                  return {
                    ...flower,
                    name: updatedFlower.name,
                    image: updatedFlower.image,
                  };
                }
              ),
          }));


      if (
        affectedProducts.length > 0
      ) {
        const {
          error: productError,
        } = await supabase
          .from('products')
          .upsert(
            affectedProducts,
            {
              onConflict: 'id',
            }
          );


        if (productError) {
          throw productError;
        }
      }


      setMasterFlowers(
        previous =>
          previous.map(
            flower =>
              flower.id ===
              editingFlower.id
                ? updatedFlower
                : flower
          )
      );


      if (
        affectedProducts.length > 0
      ) {
        const updatedMap =
          new Map(
            affectedProducts.map(
              product => [
                product.id,
                product,
              ]
            )
          );


        setProducts(
          previous =>
            previous.map(
              product =>
                updatedMap.get(
                  product.id
                ) ||
                product
            )
        );
      }


      setEditingFlower(null);
      setEditFlowerName('');
      setEditFlowerImage('');
    } catch (error) {
      console.error(error);

      setDatabaseError(
        `Could not edit flower: ${error.message}`
      );
    } finally {
      setSavingFlowerEdit(false);
    }
  }


  /* ============================================================
     EDIT PRODUCT
  ============================================================ */

  function openEditProduct(
    product,
    event
  ) {
    event?.stopPropagation();

    setEditingProduct(product);
    setEditProductName(product.name || '');
    setEditProductPrice(product.price || '');
    setEditProductImage(product.image || '');

    setEditProductFlowers(
      (product.flowers || []).map(
        flower => ({
          ...flower,
        })
      )
    );

    setSelectedEditProductFlower(null);
    setEditProductFlowerCount(1);
    setEditProductPickerSearch('');
    setIsEditProductPickerOpen(false);
  }


  function closeEditProduct() {
    if (savingProductEdit) {
      return;
    }

    setEditingProduct(null);
    setEditProductName('');
    setEditProductPrice('');
    setEditProductImage('');
    setEditProductFlowers([]);
    setSelectedEditProductFlower(null);
    setEditProductFlowerCount(1);
    setEditProductPickerSearch('');
    setIsEditProductPickerOpen(false);
  }


  function addFlowerToEditProduct() {
    if (!selectedEditProductFlower) {
      return;
    }

    const newFlower = {
      name: selectedEditProductFlower.name,
      image: selectedEditProductFlower.image,

      count:
        parseInt(
          editProductFlowerCount,
          10
        ) || 1,
    };


    setEditProductFlowers(
      previous => [
        ...previous,
        newFlower,
      ]
    );


    setSelectedEditProductFlower(null);
    setEditProductFlowerCount(1);
    setEditProductPickerSearch('');
    setIsEditProductPickerOpen(false);
  }


  function removeFlowerFromEditProduct(index) {
    setEditProductFlowers(
      previous =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );
  }


  function updateEditProductFlowerQuantity(
    index,
    value
  ) {
    const count =
      Math.max(
        1,
        parseInt(
          value,
          10
        ) || 1
      );


    setEditProductFlowers(
      previous =>
        previous.map(
          (flower, i) =>
            i === index
              ? {
                  ...flower,
                  count,
                }
              : flower
        )
    );
  }


  async function handleSaveProductEdit(event) {
    event.preventDefault();

    if (
      !editingProduct ||
      !editProductName.trim() ||
      !editProductPrice.trim()
    ) {
      return;
    }

    setSavingProductEdit(true);
    setDatabaseError('');


    const updatedProduct = {
      ...editingProduct,
      name: editProductName.trim(),
      price: formatPrice(editProductPrice),
      image: editProductImage.trim(),
      flowers: editProductFlowers,
    };


    try {
      const {
        error,
      } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          price: updatedProduct.price,
          image: updatedProduct.image,
          flowers: updatedProduct.flowers,
        })
        .eq(
          'id',
          editingProduct.id
        );


      if (error) {
        throw error;
      }


      setProducts(
        previous =>
          previous.map(
            product =>
              product.id ===
              editingProduct.id
                ? updatedProduct
                : product
          )
      );


      setEditingProduct(null);
      setEditProductName('');
      setEditProductPrice('');
      setEditProductImage('');
      setEditProductFlowers([]);
      setSelectedEditProductFlower(null);
    } catch (error) {
      console.error(error);

      setDatabaseError(
        `Could not edit bouquet: ${error.message}`
      );
    } finally {
      setSavingProductEdit(false);
    }
  }


  /* ============================================================
     EDIT ARRANGEMENT
  ============================================================ */

  function openEditArrangement(
    arrangement,
    event
  ) {
    event?.stopPropagation();

    setEditingArrangement(arrangement);
    setEditArrangementName(arrangement.name || '');
    setEditArrangementPrice(arrangement.price || '');
    setEditArrangementImage(arrangement.image || '');
  }


  function closeEditArrangement() {
    if (savingArrangementEdit) {
      return;
    }

    setEditingArrangement(null);
    setEditArrangementName('');
    setEditArrangementPrice('');
    setEditArrangementImage('');
  }


  async function handleSaveArrangementEdit(event) {
    event.preventDefault();

    if (
      !editingArrangement ||
      !editArrangementName.trim() ||
      !editArrangementPrice.trim()
    ) {
      return;
    }

    setSavingArrangementEdit(true);
    setDatabaseError('');


    const updatedArrangement = {
      ...editingArrangement,
      name: editArrangementName.trim(),
      price: formatPrice(editArrangementPrice),
      image: editArrangementImage.trim(),
    };


    try {
      const {
        error,
      } = await supabase
        .from('arrangements')
        .update({
          name: updatedArrangement.name,
          price: updatedArrangement.price,
          image: updatedArrangement.image,
        })
        .eq(
          'id',
          editingArrangement.id
        );


      if (error) {
        throw error;
      }


      setArrangements(
        previous =>
          previous.map(
            arrangement =>
              arrangement.id ===
              editingArrangement.id
                ? updatedArrangement
                : arrangement
          )
      );


      setEditingArrangement(null);
      setEditArrangementName('');
      setEditArrangementPrice('');
      setEditArrangementImage('');
    } catch (error) {
      console.error(error);

      setDatabaseError(
        `Could not edit arrangement: ${error.message}`
      );
    } finally {
      setSavingArrangementEdit(false);
    }
  }


  /* ============================================================
     DELETE
  ============================================================ */

  async function deleteFlower(
    id,
    event
  ) {
    event.stopPropagation();

    if (
      !window.confirm(
        'Delete this flower?'
      )
    ) {
      return;
    }


    const {
      error,
    } = await supabase
      .from('flowers')
      .delete()
      .eq('id', id);


    if (error) {
      setDatabaseError(error.message);
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


  async function deleteArrangement(
    id,
    event
  ) {
    event.stopPropagation();

    if (
      !window.confirm(
        'Delete this arrangement?'
      )
    ) {
      return;
    }


    const {
      error,
    } = await supabase
      .from('arrangements')
      .delete()
      .eq('id', id);


    if (error) {
      setDatabaseError(error.message);
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


  async function deleteProduct(
    id,
    event
  ) {
    event.stopPropagation();

    if (
      !window.confirm(
        'Delete this bouquet?'
      )
    ) {
      return;
    }


    const {
      error,
    } = await supabase
      .from('products')
      .delete()
      .eq('id', id);


    if (error) {
      setDatabaseError(error.message);
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


  /* ============================================================
     ADD ARRANGEMENT
  ============================================================ */

  async function handleAddArrangement(event) {
    event.preventDefault();

    if (
      !newArrangementName.trim() ||
      !newArrangementPrice.trim()
    ) {
      return;
    }


    const arrangement = {
      id:
        `arrangement-${Date.now()}`,

      name:
        newArrangementName.trim(),

      price:
        formatPrice(
          newArrangementPrice
        ),

      image:
        newArrangementImage.trim() ||
        'https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/botanicalleaf.png',
    };


    const {
      error,
    } = await supabase
      .from('arrangements')
      .insert(arrangement);


    if (error) {
      setDatabaseError(error.message);
      return;
    }


    setArrangements(
      previous => [
        arrangement,
        ...previous,
      ]
    );


    setNewArrangementName('');
    setNewArrangementPrice('');
    setNewArrangementImage('');
    setIsAddingArrangement(false);
  }


  /* ============================================================
     BOUQUET FLOWERS
  ============================================================ */

  async function addFlowerToProduct(event) {
    event.preventDefault();

    if (
      !selectedProduct ||
      !selectedMasterFlower
    ) {
      return;
    }


    const updatedFlowers = [
      ...(
        selectedProduct.flowers ||
        []
      ),

      {
        name:
          selectedMasterFlower.name,

        image:
          selectedMasterFlower.image,

        count:
          parseInt(
            recipeFlowerCount,
            10
          ) || 1,
      },
    ];


    const {
      error,
    } = await supabase
      .from('products')
      .update({
        flowers:
          updatedFlowers,
      })
      .eq(
        'id',
        selectedProduct.id
      );


    if (error) {
      setDatabaseError(error.message);
      return;
    }


    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };


    setProducts(
      previous =>
        previous.map(
          product =>
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


  async function removeFlowerFromProduct(index) {
    if (!selectedProduct) {
      return;
    }


    const updatedFlowers =
      (
        selectedProduct.flowers ||
        []
      ).filter(
        (_, i) =>
          i !== index
      );


    const {
      error,
    } = await supabase
      .from('products')
      .update({
        flowers:
          updatedFlowers,
      })
      .eq(
        'id',
        selectedProduct.id
      );


    if (error) {
      setDatabaseError(error.message);
      return;
    }


    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };


    setProducts(
      previous =>
        previous.map(
          product =>
            product.id ===
            updatedProduct.id
              ? updatedProduct
              : product
        )
    );
  }


  /* ============================================================
     DIRECT QUANTITY EDIT
  ============================================================ */

  function startQuantityEdit(
    index,
    currentCount
  ) {
    setEditingQuantityIndex(index);

    setQuantityDraft(
      String(
        currentCount || 1
      )
    );
  }


  function cancelQuantityEdit() {
    setEditingQuantityIndex(null);
    setQuantityDraft('');
  }


  async function saveQuantityEdit(index) {
    if (
      !selectedProduct ||
      savingQuantity
    ) {
      return;
    }


    const quantity =
      Math.max(
        1,
        parseInt(
          quantityDraft,
          10
        ) || 1
      );


    const updatedFlowers =
      (
        selectedProduct.flowers ||
        []
      ).map(
        (flower, i) =>
          i === index
            ? {
                ...flower,
                count: quantity,
              }
            : flower
      );


    setSavingQuantity(true);


    const {
      error,
    } = await supabase
      .from('products')
      .update({
        flowers:
          updatedFlowers,
      })
      .eq(
        'id',
        selectedProduct.id
      );


    if (error) {
      setDatabaseError(
        `Could not update quantity: ${error.message}`
      );

      setSavingQuantity(false);

      return;
    }


    const updatedProduct = {
      ...selectedProduct,
      flowers: updatedFlowers,
    };


    setProducts(
      previous =>
        previous.map(
          product =>
            product.id ===
            updatedProduct.id
              ? updatedProduct
              : product
        )
    );


    setEditingQuantityIndex(null);
    setQuantityDraft('');
    setSavingQuantity(false);
  }


  /* ============================================================
     FILTERS
  ============================================================ */

  const search =
    searchQuery
      .trim()
      .toLowerCase();


  const filteredProducts =
    products.filter(
      product => {
        const matchesTab =
          activeTab === 'all' ||
          product.category ===
            activeTab;


        const matchesSearch =
          (
            product.name || ''
          )
            .toLowerCase()
            .includes(search);


        return (
          matchesTab &&
          matchesSearch
        );
      }
    );


  const filteredFlowers =
    masterFlowers.filter(
      flower =>
        (
          flower.name || ''
        )
          .toLowerCase()
          .includes(search)
    );


  const filteredArrangements =
    arrangements.filter(
      arrangement =>
        (
          arrangement.name ||
          ''
        )
          .toLowerCase()
          .includes(search)
    );


  const pickerFlowers =
    masterFlowers.filter(
      flower =>
        (
          flower.name || ''
        )
          .toLowerCase()
          .includes(
            flowerPickerSearch.toLowerCase()
          )
    );


  const modalFlowers =
    masterFlowers.filter(
      flower =>
        (
          flower.name || ''
        )
          .toLowerCase()
          .includes(
            modalPickerSearch.toLowerCase()
          )
    );


  const editProductPickerFlowers =
    masterFlowers.filter(
      flower =>
        (
          flower.name || ''
        )
          .toLowerCase()
          .includes(
            editProductPickerSearch.toLowerCase()
          )
    );


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mx-auto mb-4" />

          <h2 className="font-bold text-lg">
            The Crochet Garden
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Loading catalogue...
          </p>

        </div>

      </div>
    );
  }


  /* ============================================================
     UI
  ============================================================ */

  return (
    <div
      className={`${
        darkMode
          ? 'dark bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      } min-h-screen flex font-sans`}
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
        } border-r sticky top-0 h-screen flex flex-col justify-between transition-all z-20`}
      >

        <div>

          <div className="flex items-center justify-between mb-10">

            {sidebarOpen ? (

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shrink-0">

                  <img
                    src="https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/logo.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />

                </div>


                <div>

                  <h1 className="font-bold text-base leading-tight">
                    The Crochet Garden
                  </h1>

                  <p className="text-xs text-slate-400">
                    Product Dashboard
                  </p>

                </div>

              </div>

            ) : (

              <img
                src="https://raw.githubusercontent.com/del-elatum/tcgdashboard/refs/heads/main/logo.png"
                alt=""
                className="w-10 h-10 rounded-2xl shadow-md mx-auto"
              />

            )}


            {sidebarOpen && (

              <button
                onClick={() =>
                  setSidebarOpen(false)
                }
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-slate-100
                  border
                  border-slate-200
                  text-slate-700
                  shadow-sm
                  hover:bg-slate-200
                  dark:bg-slate-800
                  dark:border-slate-700
                  dark:text-slate-100
                  dark:hover:bg-slate-700
                  transition-all
                "
                title="Collapse Sidebar"
              >

                <PanelLeftClose
                  className="w-5 h-5"
                  strokeWidth={2}
                />

              </button>

            )}

          </div>


          {!sidebarOpen && (

            <div className="flex justify-center mb-6">

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-slate-100
                  border
                  border-slate-200
                  text-slate-700
                  shadow-sm
                  hover:bg-slate-200
                  dark:bg-slate-800
                  dark:border-slate-700
                  dark:text-slate-100
                  dark:hover:bg-slate-700
                  transition-all
                "
                title="Expand Sidebar"
              >

                <PanelLeftOpen
                  className="w-5 h-5"
                  strokeWidth={2}
                />

              </button>

            </div>

          )}


          <nav className="space-y-2">

            {[
              {
                id: 'all',
                label: 'All Products',
                icon: Package,
              },

              {
                id: 'single-flowers',
                label: 'Single Flowers',
                icon: Flower2,
              },

              {
                id: 'ready-bouquets',
                label: 'Ready Bouquets',
                icon: Gift,
              },

              {
                id: 'arrangements',
                label: 'Arrangements',
                icon: Sparkles,
              },
            ].map(
              tab => {

                const Icon =
                  tab.icon;


                const active =
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-slate-800 text-white dark:bg-slate-700'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >

                    <Icon className="w-4 h-4 shrink-0" />

                    {sidebarOpen && (
                      <span>
                        {tab.label}
                      </span>
                    )}

                  </button>

                );
              }
            )}

          </nav>

        </div>


        <div
          className={`p-3 rounded-2xl flex items-center justify-between ${
            darkMode
              ? 'bg-slate-800'
              : 'bg-slate-100'
          }`}
        >

          {sidebarOpen && (

            <span className="text-xs font-semibold text-slate-400">
              DARK MODE
            </span>

          )}


          <button
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              darkMode
                ? 'bg-slate-600'
                : 'bg-slate-300'
            }`}
          >

            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                darkMode
                  ? 'translate-x-6'
                  : ''
              }`}
            />

          </button>

        </div>

      </aside>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">


        {databaseError && (

          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex justify-between">

            <span className="text-sm">
              {databaseError}
            </span>

            <button
              onClick={() =>
                setDatabaseError('')
              }
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        )}


        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">

          <div className="flex items-start gap-4">


            {selectedProduct && (

              <button
                onClick={() =>
                  setSelectedProduct(null)
                }
                className={`w-11 h-11 rounded-full shrink-0 border shadow-sm flex items-center justify-center transition hover:scale-105 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >

                <ArrowLeft className="w-5 h-5" />

              </button>

            )}


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
                    ? 'Master inventory of individual flowers.'
                    : activeTab ===
                        'arrangements'
                      ? 'Master catalogue of arrangements.'
                      : `Showing ${filteredProducts.length} items in your catalogue.`}

              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <div
              className={`flex items-center rounded-2xl border shadow-sm px-4 py-2.5 w-80 max-w-full ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >

              <Search className="w-4 h-4 text-slate-400 mr-2" />

              <input
                value={searchQuery}
                onChange={
                  event =>
                    setSearchQuery(
                      event.target.value
                    )
                }
                placeholder="Search..."
                className="w-full bg-transparent outline-none text-sm"
              />

            </div>


            {!selectedProduct &&
              activeTab ===
                'single-flowers' && (

                <button
                  onClick={() =>
                    setIsAddingFlower(true)
                  }
                  className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg"
                >

                  <Plus className="w-5 h-5" />

                </button>

              )}


            {!selectedProduct &&
              activeTab ===
                'ready-bouquets' && (

                <button
                  onClick={() =>
                    setIsAddingProduct(true)
                  }
                  className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg"
                >

                  <Plus className="w-5 h-5" />

                </button>

              )}


            {!selectedProduct &&
              activeTab ===
                'arrangements' && (

                <button
                  onClick={() =>
                    setIsAddingArrangement(true)
                  }
                  className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg"
                >

                  <Plus className="w-5 h-5" />

                </button>

              )}

          </div>

        </div>


        {/* ====================================================
            FLOWERS DATABASE
        ==================================================== */}

        {activeTab ===
          'single-flowers' &&
        !selectedProduct ? (

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

            {filteredFlowers.map(
              flower => (

                <div
                  key={flower.id}
                  className={`group relative rounded-3xl border p-4 shadow-sm hover:shadow-xl transition-all text-center ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >

                  <button
                    onClick={
                      event =>
                        openEditFlower(
                          flower,
                          event
                        )
                    }
                    className="absolute top-2 left-2 bg-slate-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  >

                    <Pencil className="w-3.5 h-3.5" />

                  </button>


                  <button
                    onClick={
                      event =>
                        deleteFlower(
                          flower.id,
                          event
                        )
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  >

                    <Trash2 className="w-3.5 h-3.5" />

                  </button>


                  <div
                    onClick={() =>
                      setZoomedImage(
                        flower.image
                      )
                    }
                    className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-slate-100 mb-3 cursor-pointer"
                  >

                    <img
                      src={flower.image}
                      alt={flower.name}
                      className="w-full h-full object-cover"
                    />

                  </div>


                  <p className="font-bold text-sm">
                    {flower.name}
                  </p>

                </div>

              )
            )}

          </div>


        ) : activeTab ===
            'arrangements' &&
          !selectedProduct ? (


          /* ====================================================
             ARRANGEMENTS
          ==================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {filteredArrangements.map(
              arrangement => (

                <div
                  key={arrangement.id}
                  className={`group relative rounded-3xl border p-5 shadow-sm hover:shadow-xl transition ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >

                  <button
                    onClick={
                      event =>
                        openEditArrangement(
                          arrangement,
                          event
                        )
                    }
                    className="absolute top-3 left-3 bg-slate-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  >

                    <Pencil className="w-4 h-4" />

                  </button>


                  <button
                    onClick={
                      event =>
                        deleteArrangement(
                          arrangement.id,
                          event
                        )
                    }
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  >

                    <Trash2 className="w-4 h-4" />

                  </button>


                  <div
                    onClick={() =>
                      setZoomedImage(
                        arrangement.image
                      )
                    }
                    className="aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer"
                  >

                    <img
                      src={arrangement.image}
                      alt={arrangement.name}
                      className="w-full h-full object-cover"
                    />

                  </div>


                  <div className="text-center mt-4">

                    <h3 className="font-bold">
                      {arrangement.name}
                    </h3>

                    <span className="inline-block mt-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      {arrangement.price}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>


        ) : selectedProduct ? (


          /* ====================================================
             PRODUCT DETAIL
          ==================================================== */

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


            <div
              className={`rounded-3xl border p-6 shadow-sm relative ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >

              <button
                onClick={
                  event =>
                    openEditProduct(
                      selectedProduct,
                      event
                    )
                }
                className="absolute top-8 left-8 z-10 bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
              >

                <Pencil className="w-4 h-4" />

              </button>


              <div
                onClick={() =>
                  setZoomedImage(
                    selectedProduct.image
                  )
                }
                className="aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer"
              >

                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain"
                />

              </div>


              <div className="text-center mt-5">

                <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedProduct.price}
                </span>


                <h3 className="text-xl font-bold mt-4">
                  {selectedProduct.name}
                </h3>

              </div>

            </div>


            <div
              className={`lg:col-span-2 rounded-3xl border p-6 md:p-8 shadow-sm ${
                darkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >

              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">

                <h3 className="text-lg font-bold">
                  Required Flowers & Components
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Click a quantity number to edit it directly
                </p>

              </div>


              {/* ==================================================
                  EXISTING BOUQUET FLOWER PICKER
              ================================================== */}

              <form
                onSubmit={addFlowerToProduct}
                className="flex gap-2 mt-6 mb-6"
              >

                <div
                  ref={pickerRef}
                  className="relative flex-1"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setIsFlowerPickerOpen(
                        !isFlowerPickerOpen
                      )
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >

                    {selectedMasterFlower ? (

                      <div className="flex items-center gap-3">

                        <img
                          src={selectedMasterFlower.image}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover"
                        />

                        <span>
                          {selectedMasterFlower.name}
                        </span>

                      </div>

                    ) : (

                      <span className="text-slate-400">
                        Select a flower from database...
                      </span>

                    )}


                    <ChevronDown className="w-4 h-4" />

                  </button>


                  {isFlowerPickerOpen && (

                    <div
                      className={`absolute top-full mt-2 left-0 right-0 z-40 rounded-2xl border p-3 shadow-2xl ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                      }`}
                    >

                      {/* SEARCH — ALWAYS DARK WITH WHITE TEXT */}

                      <div className="flex items-center bg-slate-800 rounded-xl px-3 mb-3">

                        <Search className="w-4 h-4 text-slate-300 shrink-0" />

                        <input
                          value={flowerPickerSearch}
                          onChange={
                            event =>
                              setFlowerPickerSearch(
                                event.target.value
                              )
                          }
                          placeholder="Search flowers..."
                          className="
                            w-full
                            bg-transparent
                            p-3
                            outline-none
                            text-sm
                            text-white
                            placeholder:text-slate-300
                          "
                        />

                      </div>


                      <div className="max-h-56 overflow-auto">

                        {pickerFlowers.map(
                          flower => (

                            <button
                              type="button"
                              key={flower.id}
                              onClick={() => {

                                setSelectedMasterFlower(
                                  flower
                                );

                                setIsFlowerPickerOpen(
                                  false
                                );

                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                            >

                              <img
                                src={flower.image}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover"
                              />

                              <span className="text-sm font-semibold">
                                {flower.name}
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>


                <input
                  type="number"
                  min="1"
                  value={recipeFlowerCount}
                  onChange={
                    event =>
                      setRecipeFlowerCount(
                        event.target.value
                      )
                  }
                  className={`w-20 px-3 rounded-xl border ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />


                <button
                  type="submit"
                  className="bg-slate-900 text-white rounded-xl px-5 font-semibold flex items-center gap-2"
                >

                  <Plus className="w-4 h-4" />

                  Add

                </button>

              </form>


              {/* ==================================================
                  FLOWER CARDS
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {(
                  selectedProduct.flowers ||
                  []
                ).map(
                  (
                    flower,
                    index
                  ) => {

                    const flowerImage =
                      getFlowerImage(
                        flower
                      );


                    const editingThisQuantity =
                      editingQuantityIndex ===
                      index;


                    return (

                      <div
                        key={`${flower.name}-${index}`}
                        className={`relative rounded-2xl border p-4 min-h-[150px] ${
                          darkMode
                            ? 'bg-slate-800/40 border-slate-800'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >


                        <button
                          onClick={() =>
                            removeFlowerFromProduct(
                              index
                            )
                          }
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow z-10"
                        >

                          <X className="w-3.5 h-3.5" />

                        </button>


                        <div className="flex items-center gap-5 w-full pr-8">


                          {/* IMAGE */}

                          <div
                            onClick={() =>
                              flowerImage &&
                              setZoomedImage(
                                flowerImage
                              )
                            }
                            className="
                              w-28
                              h-28
                              md:w-32
                              md:h-32
                              rounded-2xl
                              overflow-hidden
                              bg-white
                              shrink-0
                              shadow
                              cursor-pointer
                            "
                          >

                            {flowerImage ? (

                              <img
                                src={flowerImage}
                                alt={flower.name}
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                No image
                              </div>

                            )}

                          </div>


                          {/* =================================================
                              INFO AREA

                              Quantity has its own stable position ABOVE name.
                          ================================================= */}

                          <div className="flex-1 min-w-0 flex flex-col justify-center">


                            {/* QUANTITY */}

                            <div className="mb-3">

                              <span className="
                                block
                                text-[10px]
                                uppercase
                                tracking-[0.16em]
                                font-bold
                                text-slate-400
                                mb-1.5
                              ">
                                Quantity
                              </span>


                              {editingThisQuantity ? (

                                <input
                                  type="number"
                                  min="1"
                                  autoFocus
                                  value={quantityDraft}
                                  disabled={savingQuantity}
                                  onChange={
                                    event =>
                                      setQuantityDraft(
                                        event.target.value
                                      )
                                  }
                                  onBlur={() =>
                                    saveQuantityEdit(
                                      index
                                    )
                                  }
                                  onKeyDown={
                                    event => {

                                      if (
                                        event.key ===
                                        'Enter'
                                      ) {
                                        event.preventDefault();

                                        event.currentTarget.blur();
                                      }


                                      if (
                                        event.key ===
                                        'Escape'
                                      ) {
                                        event.preventDefault();

                                        cancelQuantityEdit();
                                      }

                                    }
                                  }
                                  className="
                                    w-11
                                    h-11
                                    rounded-full
                                    bg-slate-900
                                    text-white
                                    text-center
                                    text-lg
                                    font-black
                                    outline-none
                                    ring-4
                                    ring-slate-200
                                    dark:ring-slate-700
                                  "
                                />

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    startQuantityEdit(
                                      index,
                                      flower.count
                                    )
                                  }
                                  className="
                                    w-11
                                    h-11
                                    rounded-full
                                    bg-slate-900
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    shadow-md
                                    transition
                                    hover:scale-105
                                  "
                                >

                                  <span className="text-lg font-black leading-none">
                                    {flower.count}
                                  </span>

                                </button>

                              )}

                            </div>


                            {/* NAME */}

                            <h4 className="
                              font-bold
                              text-base
                              leading-snug
                              break-words
                            ">
                              {flower.name}
                            </h4>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          </div>


        ) : (


          /* ====================================================
             PRODUCT GRID
          ==================================================== */

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
                  className={`group relative rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl cursor-pointer transition ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >

                  <button
                    onClick={
                      event =>
                        openEditProduct(
                          product,
                          event
                        )
                    }
                    className="absolute top-3 left-3 z-20 bg-slate-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >

                    <Pencil className="w-4 h-4" />

                  </button>


                  <button
                    onClick={
                      event =>
                        deleteProduct(
                          product.id,
                          event
                        )
                    }
                    className="absolute top-3 left-14 z-20 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >

                    <Trash2 className="w-4 h-4" />

                  </button>


                  <div className="aspect-square bg-slate-100 relative">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />


                    <span className="absolute top-3 right-3 bg-white/95 text-slate-900 rounded-full px-3 py-1 text-xs font-bold shadow">
                      {product.price}
                    </span>

                  </div>


                  <div className="p-5">

                    <h3 className="font-bold text-base">
                      {product.name}
                    </h3>

                  </div>


                  <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-400">

                    <span className="flex items-center gap-2">

                      <Flower2 className="w-4 h-4" />

                      {
                        (
                          product.flowers ||
                          []
                        ).length
                      } flower types

                    </span>


                    <span className="flex items-center gap-1 font-semibold">

                      View Details

                      <ChevronRight className="w-4 h-4" />

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}


      </main>


      {/* ======================================================
          IMAGE ZOOM
      ====================================================== */}

      {zoomedImage && (

        <div
          onClick={() =>
            setZoomedImage(null)
          }
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
        >

          <div
            onClick={
              event =>
                event.stopPropagation()
            }
            className="relative max-w-4xl max-h-[90vh]"
          >

            <button
              onClick={() =>
                setZoomedImage(null)
              }
              className="absolute -top-12 right-0 text-white"
            >

              <X className="w-7 h-7" />

            </button>


            <img
              src={zoomedImage}
              alt=""
              className="max-h-[85vh] max-w-full rounded-2xl"
            />

          </div>

        </div>

      )}


      {/* ======================================================
          ADD FLOWER
      ====================================================== */}

      {isAddingFlower && (

        <ModalShell
          darkMode={darkMode}
        >

          <h3 className="text-lg font-bold mb-5">
            Add Flower
          </h3>


          <form
            onSubmit={handleAddFlower}
            className="space-y-4"
          >

            <Field
              label="Flower Name"
              value={newFlowerName}
              onChange={setNewFlowerName}
              darkMode={darkMode}
              required
            />


            <Field
              label="Image URL"
              value={newFlowerImage}
              onChange={setNewFlowerImage}
              darkMode={darkMode}
            />


            <ModalButtons
              onCancel={() =>
                setIsAddingFlower(false)
              }
              saveText="Save Flower"
            />

          </form>

        </ModalShell>

      )}


      {/* ======================================================
          EDIT FLOWER
      ====================================================== */}

      {editingFlower && (

        <ModalShell
          darkMode={darkMode}
        >

          <ModalTitle
            title="Edit Flower"
            subtitle="Changes also update existing bouquets."
            onClose={closeEditFlower}
          />


          <form
            onSubmit={handleSaveFlowerEdit}
            className="space-y-4"
          >

            <Field
              label="Flower Name"
              value={editFlowerName}
              onChange={setEditFlowerName}
              darkMode={darkMode}
              required
            />


            <Field
              label="Image URL"
              value={editFlowerImage}
              onChange={setEditFlowerImage}
              darkMode={darkMode}
            />


            {editFlowerImage && (

              <ImagePreview
                image={editFlowerImage}
                name={editFlowerName}
              />

            )}


            <ModalButtons
              onCancel={closeEditFlower}
              saveText={
                savingFlowerEdit
                  ? 'Saving...'
                  : 'Save Changes'
              }
              disabled={savingFlowerEdit}
            />

          </form>

        </ModalShell>

      )}


      {/* ======================================================
          EDIT PRODUCT
      ====================================================== */}

      {editingProduct && (

        <ModalShell
          darkMode={darkMode}
          large
        >

          <ModalTitle
            title="Edit Bouquet"
            subtitle="Update product details and flower composition."
            onClose={closeEditProduct}
          />


          <form
            onSubmit={handleSaveProductEdit}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field
                label="Bouquet Name"
                value={editProductName}
                onChange={setEditProductName}
                darkMode={darkMode}
                required
              />


              <Field
                label="Price"
                value={editProductPrice}
                onChange={setEditProductPrice}
                darkMode={darkMode}
                required
              />

            </div>


            <Field
              label="Image URL"
              value={editProductImage}
              onChange={setEditProductImage}
              darkMode={darkMode}
            />


            {editProductImage && (

              <ImagePreview
                image={editProductImage}
                name={editProductName}
              />

            )}


            <div>

              <div className="flex items-center justify-between mb-3">

                <div>

                  <h4 className="font-bold text-sm">
                    Flower Composition
                  </h4>

                  <p className="text-xs text-slate-400 mt-1">
                    Add, remove or change quantities.
                  </p>

                </div>


                <span className="text-xs font-bold text-slate-400">
                  {editProductFlowers.length} types
                </span>

              </div>


              <div className="flex gap-2 mb-4">

                <div
                  ref={editProductPickerRef}
                  className="relative flex-1"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setIsEditProductPickerOpen(
                        !isEditProductPickerOpen
                      )
                    }
                    className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >

                    {selectedEditProductFlower ? (

                      <span>
                        {selectedEditProductFlower.name}
                      </span>

                    ) : (

                      <span className="text-slate-400">
                        Add another flower...
                      </span>

                    )}


                    <ChevronDown className="w-4 h-4 text-slate-400" />

                  </button>


                  {isEditProductPickerOpen && (

                    <div
                      className={`absolute z-[100] left-0 right-0 top-full mt-2 rounded-2xl border shadow-xl p-3 ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                      }`}
                    >

                      {/* ALWAYS DARK SEARCH */}

                      <div className="flex items-center bg-slate-800 rounded-xl px-3 mb-2">

                        <Search className="w-4 h-4 text-slate-300" />

                        <input
                          value={editProductPickerSearch}
                          onChange={
                            event =>
                              setEditProductPickerSearch(
                                event.target.value
                              )
                          }
                          placeholder="Search flowers..."
                          className="
                            w-full
                            bg-transparent
                            p-3
                            outline-none
                            text-sm
                            text-white
                            placeholder:text-slate-300
                          "
                        />

                      </div>


                      <div className="max-h-44 overflow-auto">

                        {editProductPickerFlowers.map(
                          flower => (

                            <button
                              key={flower.id}
                              type="button"
                              onClick={() => {

                                setSelectedEditProductFlower(
                                  flower
                                );

                                setIsEditProductPickerOpen(
                                  false
                                );

                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                            >

                              <img
                                src={flower.image}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover"
                              />

                              <span className="text-sm font-semibold">
                                {flower.name}
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>


                <input
                  type="number"
                  min="1"
                  value={editProductFlowerCount}
                  onChange={
                    event =>
                      setEditProductFlowerCount(
                        event.target.value
                      )
                  }
                  className={`w-20 px-3 rounded-xl border text-center ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />


                <button
                  type="button"
                  onClick={addFlowerToEditProduct}
                  className="px-4 rounded-xl bg-slate-900 text-white font-semibold"
                >
                  Add
                </button>

              </div>


              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">

                {editProductFlowers.map(
                  (
                    flower,
                    index
                  ) => (

                    <div
                      key={`${flower.name}-${index}`}
                      className={`flex items-center gap-3 rounded-2xl border p-3 ${
                        darkMode
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >

                      <img
                        src={getFlowerImage(flower)}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                      />


                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-bold truncate">
                          {flower.name}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">
                          Quantity
                        </p>

                      </div>


                      <input
                        type="number"
                        min="1"
                        value={flower.count}
                        onChange={
                          event =>
                            updateEditProductFlowerQuantity(
                              index,
                              event.target.value
                            )
                        }
                        className={`w-16 h-10 rounded-xl border text-center font-bold ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                      />


                      <button
                        type="button"
                        onClick={() =>
                          removeFlowerFromEditProduct(
                            index
                          )
                        }
                        className="w-9 h-9 rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 flex items-center justify-center"
                      >

                        <Trash2 className="w-4 h-4" />

                      </button>

                    </div>

                  )
                )}

              </div>

            </div>


            <ModalButtons
              onCancel={closeEditProduct}
              saveText={
                savingProductEdit
                  ? 'Saving...'
                  : 'Save Bouquet'
              }
              disabled={savingProductEdit}
            />

          </form>

        </ModalShell>

      )}


      {/* ======================================================
          EDIT ARRANGEMENT
      ====================================================== */}

      {editingArrangement && (

        <ModalShell
          darkMode={darkMode}
        >

          <ModalTitle
            title="Edit Arrangement"
            subtitle="Update its name, price or image."
            onClose={closeEditArrangement}
          />


          <form
            onSubmit={handleSaveArrangementEdit}
            className="space-y-4"
          >

            <Field
              label="Arrangement Name"
              value={editArrangementName}
              onChange={setEditArrangementName}
              darkMode={darkMode}
              required
            />


            <Field
              label="Price"
              value={editArrangementPrice}
              onChange={setEditArrangementPrice}
              darkMode={darkMode}
              required
            />


            <Field
              label="Image URL"
              value={editArrangementImage}
              onChange={setEditArrangementImage}
              darkMode={darkMode}
            />


            {editArrangementImage && (

              <ImagePreview
                image={editArrangementImage}
                name={editArrangementName}
              />

            )}


            <ModalButtons
              onCancel={closeEditArrangement}
              saveText={
                savingArrangementEdit
                  ? 'Saving...'
                  : 'Save Arrangement'
              }
              disabled={savingArrangementEdit}
            />

          </form>

        </ModalShell>

      )}


      {/* ======================================================
          ADD ARRANGEMENT
      ====================================================== */}

      {isAddingArrangement && (

        <ModalShell
          darkMode={darkMode}
        >

          <h3 className="text-lg font-bold mb-5">
            Add Arrangement
          </h3>


          <form
            onSubmit={handleAddArrangement}
            className="space-y-4"
          >

            <Field
              label="Arrangement Name"
              value={newArrangementName}
              onChange={setNewArrangementName}
              darkMode={darkMode}
              required
            />


            <Field
              label="Price"
              value={newArrangementPrice}
              onChange={setNewArrangementPrice}
              darkMode={darkMode}
              required
            />


            <Field
              label="Image URL"
              value={newArrangementImage}
              onChange={setNewArrangementImage}
              darkMode={darkMode}
            />


            <ModalButtons
              onCancel={() =>
                setIsAddingArrangement(false)
              }
              saveText="Save Arrangement"
            />

          </form>

        </ModalShell>

      )}


      {/* ======================================================
          ADD PRODUCT
      ====================================================== */}

      {isAddingProduct && (

        <ModalShell
          darkMode={darkMode}
          large
        >

          <h3 className="text-lg font-bold mb-5">
            Add New Product
          </h3>


          <form
            onSubmit={handleAddProduct}
            className="space-y-4"
          >

            <Field
              label="Product Name"
              value={newName}
              onChange={setNewName}
              darkMode={darkMode}
              required
            />


            <div>

              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Category
              </label>


              <select
                value={newCategory}
                onChange={
                  event =>
                    setNewCategory(
                      event.target.value
                    )
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >

                <option value="ready-bouquets">
                  Ready Bouquets
                </option>

                <option value="arrangements">
                  Arrangements
                </option>

              </select>

            </div>


            <Field
              label="Price"
              value={newPrice}
              onChange={setNewPrice}
              darkMode={darkMode}
              required
            />


            <Field
              label="Image URL"
              value={newImage}
              onChange={setNewImage}
              darkMode={darkMode}
            />


            <div>

              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Flowers
              </label>


              <div className="flex gap-2">

                <div
                  ref={modalPickerRef}
                  className="relative flex-1"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setIsModalPickerOpen(
                        !isModalPickerOpen
                      )
                    }
                    className={`w-full px-4 py-3 rounded-xl border text-left ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >

                    {selectedModalFlower
                      ? selectedModalFlower.name
                      : 'Select flower...'}

                  </button>


                  {isModalPickerOpen && (

                    <div
                      className={`absolute top-full mt-2 left-0 right-0 z-50 p-3 rounded-2xl border shadow-xl ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-slate-200'
                      }`}
                    >

                      {/* ALWAYS DARK SEARCH */}

                      <div className="flex items-center bg-slate-800 rounded-xl px-3 mb-2">

                        <Search className="w-4 h-4 text-slate-300" />

                        <input
                          value={modalPickerSearch}
                          onChange={
                            event =>
                              setModalPickerSearch(
                                event.target.value
                              )
                          }
                          placeholder="Search flowers..."
                          className="
                            w-full
                            bg-transparent
                            p-3
                            outline-none
                            text-sm
                            text-white
                            placeholder:text-slate-300
                          "
                        />

                      </div>


                      <div className="max-h-44 overflow-auto">

                        {modalFlowers.map(
                          flower => (

                            <button
                              type="button"
                              key={flower.id}
                              onClick={() => {

                                setSelectedModalFlower(
                                  flower
                                );

                                setIsModalPickerOpen(
                                  false
                                );

                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >

                              <div className="flex items-center gap-3">

                                <img
                                  src={flower.image}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover"
                                />

                                <span className="font-semibold text-sm">
                                  {flower.name}
                                </span>

                              </div>

                            </button>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>


                <input
                  type="number"
                  min="1"
                  value={modalFlowerCount}
                  onChange={
                    event =>
                      setModalFlowerCount(
                        event.target.value
                      )
                  }
                  className={`w-20 px-3 rounded-xl border ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />


                <button
                  type="button"
                  onClick={handleAddModalFlower}
                  className="bg-slate-900 text-white rounded-xl px-4"
                >
                  Add
                </button>

              </div>


              <div className="space-y-2 mt-3">

                {newModalFlowersList.map(
                  (
                    flower,
                    index
                  ) => (

                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-xl"
                    >

                      <span className="text-sm font-semibold">
                        {flower.name} × {flower.count}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          removeModalFlower(index)
                        }
                      >

                        <X className="w-4 h-4" />

                      </button>

                    </div>

                  )
                )}

              </div>

            </div>


            <ModalButtons
              onCancel={() =>
                setIsAddingProduct(false)
              }
              saveText="Save Product"
            />

          </form>

        </ModalShell>

      )}

    </div>
  );
}


/* ============================================================
   MODAL SHELL
============================================================ */

function ModalShell({
  children,
  darkMode,
  large = false,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">

      <div
        className={`${
          large
            ? 'max-w-2xl'
            : 'max-w-md'
        } w-full max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >

        {children}

      </div>

    </div>
  );
}


/* ============================================================
   MODAL TITLE
============================================================ */

function ModalTitle({
  title,
  subtitle,
  onClose,
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">

      <div>

        <h3 className="text-lg font-bold">
          {title}
        </h3>

        {subtitle && (

          <p className="text-xs text-slate-400 mt-1">
            {subtitle}
          </p>

        )}

      </div>


      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >

        <X className="w-4 h-4" />

      </button>

    </div>
  );
}


/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  darkMode,
  required = false,
}) {
  return (
    <div>

      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
        {label}
      </label>


      <input
        required={required}
        value={value}
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        className={`w-full px-4 py-3 rounded-xl border outline-none ${
          darkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}
      />

    </div>
  );
}


/* ============================================================
   IMAGE PREVIEW
============================================================ */

function ImagePreview({
  image,
  name,
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800 p-3">

      <img
        src={image}
        alt=""
        className="w-16 h-16 rounded-xl object-cover bg-white"
      />


      <div>

        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          Preview
        </p>

        <p className="text-sm font-bold mt-1">
          {name || 'Image preview'}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   MODAL BUTTONS
============================================================ */

function ModalButtons({
  onCancel,
  saveText,
  disabled = false,
}) {
  return (
    <div className="flex justify-end gap-3 pt-4">

      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-50"
      >
        Cancel
      </button>


      <button
        type="submit"
        disabled={disabled}
        className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-50"
      >
        {saveText}
      </button>

    </div>
  );
}


/* ============================================================
   RENDER
============================================================ */

ReactDOM.createRoot(
  document.getElementById(
    'app'
  )
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
