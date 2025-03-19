import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import {Searchbar, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Cappuccino',
      amount: 90,
      quantity: 0,
      image:
        'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRSa86J8qzFE-8hb2ekWRKgrSTxptuKBxOHZetAGzHFqa80TltrxDeeZQnJlDYOSxfdnJHTj7MnZAx0EpmYN5o5Fe6vVLYFziIijwtFv8zTi33rHsQpKwCj1w',
    },
    {
      id: '2',
      name: 'Choco Latte',
      amount: 130,
      quantity: 0,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '3',
      name: 'Cold Brew',
      amount: 140,
      quantity: 0,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '4',
      name: 'Latte',
      amount: 110,
      quantity: 0,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '5',
      name: 'Matcha Latte',
      amount: 140,
      quantity: 0,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '6',
      name: 'Sky Mocha',
      amount: 120,
      quantity: 0,
      image: 'https://via.placeholder.com/150',
    },
  ]);
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedItems, setSelectedItems] = useState([]);
  const bottomSheetRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onChangeSearch = query => {
    setSearchQuery(query);
    setFilteredItems(
      items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  };

  const handleAdd = id => {
    const updatedItems = items.map(item =>
      item.id === id ? {...item, quantity: item.quantity + 1} : item,
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    setSelectedItems(updatedItems.filter(item => item.quantity > 0));
    bottomSheetRef.current.open();
  };

  const handleDelete = id => {
    const updatedItems = items.map(item =>
      item.id === id
        ? {...item, quantity: Math.max(0, item.quantity - 1)}
        : item,
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    const selected = updatedItems.filter(item => item.quantity > 0);
    setSelectedItems(selected);
    if (selected.length === 0) bottomSheetRef.current.close();
  };

  const getTotalQuantity = () =>
    selectedItems.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () =>
    selectedItems.reduce(
      (total, item) => total + item.quantity * item.amount,
      0,
    );

  useEffect(() => {
    loadItems();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('items');
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setItems(parsedItems);
        setFilteredItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItems = async updatedItems => {
    try {
      await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const addProduct = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      amount: parseFloat(newItemPrice),
      quantity: 0, // Ensure the new product starts with quantity 0
      image: 'https://via.placeholder.com/150',
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    setSelectedItems(updatedItems.filter(item => item.quantity > 0)); // Update selection
    saveItems(updatedItems); // Save to AsyncStorage

    setModalVisible(false);
    setNewItemName('');
    setNewItemPrice('');
  };

  const printReceipt = async (selectedItems, getTotalPrice) => {
    try {
      await BluetoothEscposPrinter.printText('\n', {});

      // Print Store Name (Bold & Center)
      await BluetoothEscposPrinter.printText('My Shop\n', {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 2,
        heighthtimes: 2,
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });

      await BluetoothEscposPrinter.printText(
        '--------------------------\n',
        {},
      );

      // Print Items
      for (let item of selectedItems) {
        await BluetoothEscposPrinter.printText(`${item.name}\n`, {
          encoding: 'GBK',
          codepage: 0,
          align: BluetoothEscposPrinter.ALIGN.LEFT,
        });
        await BluetoothEscposPrinter.printText(
          `Qty: ${item.quantity}  x  Rs ${item.amount.toFixed(2)} = Rs ${(
            item.quantity * item.amount
          ).toFixed(2)}\n`,
          {},
        );
      }

      await BluetoothEscposPrinter.printText(
        '--------------------------\n',
        {},
      );

      // Print Total Amount
      await BluetoothEscposPrinter.printText(
        `Total: Rs ${getTotalPrice().toFixed(2)}\n`,
        {
          widthtimes: 2,
          heighthtimes: 2,
          align: BluetoothEscposPrinter.ALIGN.RIGHT,
        },
      );

      await BluetoothEscposPrinter.printText('\n\n\n', {});
    } catch (error) {
      console.error('Print Error:', error);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemAmount}>Rs {item.amount.toFixed(2)}</Text>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.iconButton}>
          <Icon name="remove-circle" size={28} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleAdd(item.id)}
          style={styles.iconButton}>
          <Icon name="add-circle" size={28} color="#34C759" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Items"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      <Animated.View
        style={[styles.floatingButtonContainer, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="add" size={30} color="#fff" />
          <Text style={styles.floatingButtonText}>Add Product</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TextInput
              placeholder="Item Name"
              style={styles.input}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              placeholder="Price"
              keyboardType="numeric"
              style={styles.input}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <View style={styles.modalButtons}>
              <Button mode="contained" onPress={addProduct}>
                Add
              </Button>
              <Button
                mode="contained"
                color="red"
                onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <RBSheet
        ref={bottomSheetRef}
        height={300}
        openDuration={250}
        customStyles={{container: styles.bottomSheet}}>
        <ScrollView>
          <Text style={styles.bottomSheetTitle}>Order Summary</Text>
          <Text style={styles.summaryText}>
            Total Items: {getTotalQuantity()}
          </Text>
          <Text style={styles.summaryText}>
            Total Price: Rs {getTotalPrice().toFixed(2)}
          </Text>
          <View style={styles.bottomSheetButtons}>
            <Button
              mode="contained"
              onPress={() => printReceipt(selectedItems, getTotalPrice)}
              style={styles.sheetButton}>
              Print
            </Button>
            <Button
              mode="contained"
              onPress={() => alert('Previewing...')}
              style={styles.sheetButton}>
              Preview
            </Button>
            <Button
              mode="contained"
              color="red"
              onPress={() => alert('Deleted Order!')}
              style={styles.sheetButton}>
              Delete
            </Button>
          </View>
        </ScrollView>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F8F8', padding: 16},
  searchBar: {marginBottom: 16, borderRadius: 10},
  grid: {paddingBottom: 100},
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    margin: 8,
    flex: 1,
  },
  itemImage: {width: 70, height: 70, borderRadius: 10, marginBottom: 8},
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemAmount: {fontSize: 14, color: '#666', marginBottom: 8},
  itemActions: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  iconButton: {padding: 5},
  itemQuantity: {marginHorizontal: 12, fontSize: 18, fontWeight: 'bold'},
  bottomSheet: {padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20},
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryText: {fontSize: 16, textAlign: 'center', marginBottom: 5},
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  sheetButton: {flex: 1, marginHorizontal: 5, borderRadius: 10},

  floatingButtonContainer: {position: 'absolute', bottom: 30, right: 20},
  floatingButton: {
    backgroundColor: '#ff6600',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  floatingButtonText: {color: '#fff', fontSize: 16, marginLeft: 10},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {flexDirection: 'row', justifyContent: 'space-between'},
});

export default Dashboard;
