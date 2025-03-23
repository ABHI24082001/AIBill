import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ScrollView,
  Button,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {db} from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {BluetoothContext} from '../BluetoothContext'; // Import the BluetoothContext

const Products = ({navigation}) => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const bottomSheetRef = React.useRef();

  const {boundAddress} = useContext(BluetoothContext); // Access Bluetooth connection state

  const defaultImageUrl =
    'https://www.fmi.org/images/default-source/default-album/food_industry_facts_header_image-1.png?sfvrsn=f903b145_0&MaxWidth=375&MaxHeight=9999&ScaleUp=false&Quality=High&Method=ResizeFitToAreaArguments&Signature=8CEF6C3C088E6048BB991059BF973485';

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, snapshot => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        quantity: doc.data().quantity || 0,
      }));
      setProducts(productList);
      setSelectedProducts(productList.filter(item => item.quantity > 0));
    });
    return () => unsubscribe();
  }, []);

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const saveProduct = async () => {
    if (!newName || !newPrice || !newStock) {
      alert('Please fill all fields (Name, Price, Stock)!');
      return;
    }
    try {
      const imageToSave = imageUri || defaultImageUrl;
      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, {
          name: newName,
          price: Number(newPrice),
          stock: Number(newStock),
          image: imageToSave,
        });
      } else {
        await addDoc(collection(db, 'products'), {
          name: newName,
          price: Number(newPrice),
          stock: Number(newStock),
          image: imageToSave,
          quantity: 0,
        });
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const editProduct = product => {
    setEditingProduct(product);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewStock(product.stock.toString());
    setImageUri(product.image);
    setModalVisible(true);
  };

  const deleteProduct = async id => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setImageUri(null);
  };

  const handleAddQuantity = async id => {
    const product = products.find(item => item.id === id);
    if (product.stock > product.quantity) {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {quantity: product.quantity + 1});
    }
  };

  const handleSubtractQuantity = async id => {
    const product = products.find(item => item.id === id);
    if (product.quantity > 0) {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {quantity: product.quantity - 1});
    }
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  };

  const printReceipt = async () => {
    if (!boundAddress) {
      alert('Please connect to a printer first.');
      return;
    }

    try {
      // Print header
      await BluetoothEscposPrinter.printText('\n', {});
      await BluetoothEscposPrinter.printText('Billing Software\n', {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 2,
        heighthtimes: 2,
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });

      await BluetoothEscposPrinter.printText(
        '==============================\n',
        {},
      );

      // Print column headers
      await BluetoothEscposPrinter.printText('Item        | Qty | Price\n', {});
      await BluetoothEscposPrinter.printText(
        '------------------------------\n',
        {},
      );

      // Print each product in the receipt
      for (const item of selectedProducts) {
        const itemName = item.name.padEnd(12).substring(0, 12); // Limit item name to 12 characters
        const quantity = item.quantity.toString().padStart(3); // Align quantity to 3 digits
        const price = `Rs ${item.price.toFixed(2)}`;
        const line = `${itemName} | ${quantity} | ${price}\n`;
        await BluetoothEscposPrinter.printText(line, {});
      }

      // Print total
      await BluetoothEscposPrinter.printText(
        '==============================\n',
        {},
      );
      await BluetoothEscposPrinter.printText(
        `Total: Rs ${getTotalPrice().toFixed(2)}\n`,
        {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 2,
          heighthtimes: 2,
          align: BluetoothEscposPrinter.ALIGN.RIGHT,
        },
      );

      // Print footer
      await BluetoothEscposPrinter.printText('\n\n', {});
      await BluetoothEscposPrinter.printText('Thank you for your purchase!\n', {
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });
      await BluetoothEscposPrinter.printText('\n\n', {});
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print receipt. Ensure printer is connected.');
    }
  };

 
  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>Rs {item.price.toFixed(2)}</Text>
      <Text style={styles.itemStock}>Stock: {item.stock}</Text>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => handleSubtractQuantity(item.id)}
          style={styles.iconButton}>
          <Icon name="remove-circle" size={28} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleAddQuantity(item.id)}
          style={styles.iconButton}>
          <Icon name="add-circle" size={28} color="#34C759" />
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => editProduct(item)}
          style={styles.editButton}>
          <Text style={styles.btnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteProduct(item.id)}
          style={styles.deleteButton}>
          <Text style={styles.btnText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>E-Commerce Products</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {selectedProducts.length > 0 && (
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={() => bottomSheetRef.current.open()}>
          <Text style={styles.btnText}>🧾 View Order</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}>
        <Text style={styles.btnText}>➕ Add Product</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TextInput
              placeholder="Product Name"
              placeholderTextColor={'#000'}
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              placeholder="Price"
              keyboardType="numeric"
              placeholderTextColor={'#000'}
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
            />
            <TextInput
              placeholder="Stock"
              keyboardType="numeric"
              placeholderTextColor={'#000'}
              style={styles.input}
              value={newStock}
              onChangeText={setNewStock}
            />
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.btnText}>📸 Pick Image</Text>
            </TouchableOpacity>
            <Image
              source={{uri: imageUri || defaultImageUrl}}
              style={styles.previewImage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
                <Text style={styles.btnText}>
                  {editingProduct ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <RBSheet
        ref={bottomSheetRef}
        height={450}
        openDuration={250}
        customStyles={{container: styles.bottomSheet}}>
        <ScrollView>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Order Summary</Text>
            <View style={styles.orderItemsContainer}>
              {selectedProducts.map(item => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.itemNameText}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} x Rs {item.price.toFixed(2)} = Rs{' '}
                    {(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Price:</Text>
              <Text style={styles.totalAmount}>
                Rs {getTotalPrice().toFixed(2)}
              </Text>
            </View>
            <View style={styles.bottomSheetButtons}>
              <TouchableOpacity
                style={styles.printButton}
                onPress={printReceipt}>
                <Text style={styles.btnText}>Print Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={() => bottomSheetRef.current.close()}>
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ea',
    padding: 15,
  },
  backButton: {marginRight: 10},
  headerText: {fontSize: 20, color: '#fff', fontWeight: 'bold'},
  grid: {padding: 10},
  itemContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
  },
  itemImage: {width: 100, height: 100, borderRadius: 10},
  itemName: {fontSize: 16, fontWeight: 'bold', marginTop: 5},
  itemPrice: {fontSize: 14, color: '#6200ea'},
  itemStock: {fontSize: 12, color: '#888'},
  itemActions: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  iconButton: {padding: 5},
  itemQuantity: {fontSize: 16, marginHorizontal: 10},
  actionButtons: {flexDirection: 'row', marginTop: 10},
  editButton: {
    backgroundColor: '#FFA500',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {backgroundColor: '#FF3B30', padding: 5, borderRadius: 5},
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  summaryButton: {
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  previewImage: {width: 100, height: 100, borderRadius: 10, marginVertical: 10},
  modalButtons: {flexDirection: 'row', justifyContent: 'space-between'},
  saveButton: {backgroundColor: '#34C759', padding: 10, borderRadius: 5},
  cancelButton: {backgroundColor: '#FF3B30', padding: 10, borderRadius: 5},
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    textAlign: 'center',
    marginBottom: 15,
  },
  orderItemsContainer: {
    marginBottom: 20,
  },
  orderItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  printButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  closeSheetButton: {
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});

export default Products;
