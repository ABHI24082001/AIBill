import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
const Menu = () => {
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
 const [isAddModalVisible, setAddModalVisible] = useState(false);
 const [newProduct, setNewProduct] = useState({name: '', price: ''});
 
  const navigation = useNavigation();

  const products = [
    {
      id: '1',
      name: 'Diet Coke',
      size: '355ml',
      price: 149,      
      image: require('../assets/image/bill.png'),
    },
    {
      id: '2',
      name: 'Sprite Can',
      size: '325ml',
      price: 112,
      image: require('../assets/image/bill.png'),
    },
    {
      id: '3',
      name: 'Apple & Grape Juice',
      size: '2L',
      price: 1199,
      image: require('../assets/image/bill.png'),
    },
    {
      id: '4',
      name: 'Orange Juice',
      size: '2L',
      price: 1199,
      image: require('../assets/image/bill.png'),
    },
    {
      id: '5',
      name: 'Coca Cola Can',
      size: '325ml',
      price: 374,
      image: require('../assets/image/bill.png'),
    },
    {
      id: '6',
      name: 'Pepsi Can',
      size: '330ml',
      price: 374,
      image: require('../assets/image/bill.png'),
    },
  ];


  
const handleAddPress = () => {
  setNewProduct({name: '', price: ''});
  setAddModalVisible(true);
};

  const toggleAddPress = item => {
    setSelectedItems(prev => ({...prev, [item.id]: !prev[item.id]}));
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => {
      const newQty = (prev[itemId] || 0) + delta;
      return {...prev, [itemId]: Math.max(0, newQty)};
    });
  };

  const calculateTotal = () => {
    let totalAmount = 0;
    let totalItems = 0;
    Object.keys(selectedItems).forEach(id => {
      if (selectedItems[id] && quantities[id]) {
        const product = products.find(p => p.id === id);
        totalAmount += product.price * quantities[id];
        totalItems += quantities[id];
      }
    });
    return {totalAmount, totalItems};
  };

  const handlePrint = () => {
    setSelectedItems({});
    setQuantities({});
    setModalVisible(false);
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.size}>{item.size}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => toggleAddPress(item)}>
        <Icon
          name={selectedItems[item.id] ? 'close' : 'add'}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      {selectedItems[item.id] && (
        <View style={styles.quantityMenu}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}>
            <Icon name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}>
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );


 const printReceipt = async () => {
   try {
     const {totalAmount, totalItems} = calculateTotal();

     // Print Business Name (Bold & Center)
     await BluetoothEscposPrinter.printText('My Shop\n', {
       encoding: 'GBK',
       codepage: 0,
       widthtimes: 2,
       heighthtimes: 2,
       align: BluetoothEscposPrinter.ALIGN.CENTER,
     });

     // Print Shop Address
     await BluetoothEscposPrinter.printText(
       '123 Main Street, City, Country\n',
       {
         encoding: 'GBK',
         codepage: 0,
         align: BluetoothEscposPrinter.ALIGN.CENTER,
       },
     );

     // Print Date and Time
     const now = new Date();
     await BluetoothEscposPrinter.printText(
       `Bill No: 12345\nDate: ${now.toLocaleDateString()}  Time: ${now.toLocaleTimeString()}\n`,
       {
         encoding: 'GBK',
         codepage: 0,
         align: BluetoothEscposPrinter.ALIGN.LEFT,
       },
     );

     await BluetoothEscposPrinter.printText('--------------------------\n', {});

     // Print Items
     Object.keys(selectedItems).forEach(async id => {
       if (selectedItems[id] && quantities[id]) {
         const product = products.find(p => p.id === id);
         const totalPrice = product.price * quantities[id];

         await BluetoothEscposPrinter.printText(`${product.name}\n`, {
           encoding: 'GBK',
           codepage: 0,
           align: BluetoothEscposPrinter.ALIGN.LEFT,
         });

         await BluetoothEscposPrinter.printText(
           `Qty: ${quantities[id]} x ₹${product.price} = ₹${totalPrice}\n`,
           {},
         );
       }
     });

     await BluetoothEscposPrinter.printText('--------------------------\n', {});

     // Print Total Items and Total Amount
     await BluetoothEscposPrinter.printText(`Total Items: ${totalItems}\n`, {});

     await BluetoothEscposPrinter.printText(`Total Amount: ₹${totalAmount}\n`, {
       widthtimes: 2,
       heighthtimes: 2,
       align: BluetoothEscposPrinter.ALIGN.RIGHT,
     });

     // Print Thank You Message
     await BluetoothEscposPrinter.printText('\nThank You for Shopping!\n', {
       encoding: 'GBK',
       codepage: 0,
       align: BluetoothEscposPrinter.ALIGN.CENTER,
     });

     await BluetoothEscposPrinter.printText('\n\n\n', {}); // Space for cutting

     // Clear selected items after printing
     handlePrint();
   } catch (error) {
     console.error('Print Error:', error);
   }
 };

  
  

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1ed2fa', '#17b0d6']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Menu</Text>
        <TouchableOpacity style={styles.roundButton} onPress={handleAddPress}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridView}
      />

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.checkoutText}>View Bill</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Bill Summary</Text>
            <Text>Total Items: {calculateTotal().totalItems}</Text>
            <Text>Total Amount: ₹{calculateTotal().totalAmount}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}>
                <Text>Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={printReceipt}
                style={styles.modalButton}>
                <Text>Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Product</Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={text => setNewProduct({...newProduct, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={newProduct.price}
              onChangeText={text => setNewProduct({...newProduct, price: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.modalButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log('New Product:', newProduct);
                  setAddModalVisible(false);
                }}
                style={styles.modalButton}>
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3fcfc',
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 5,
  },
  roundButton: {
    backgroundColor: '#03a9fc', // Green background color
    width: 30, // Fixed width for a perfect circle
    height: 30, // Fixed height for a perfect circle
    borderRadius: 25, // Half of width/height to make it circular
    justifyContent: 'center', // Center the icon vertically
    alignItems: 'center', // Center the icon horizontally
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  gridView: {
    padding: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  size: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  quantityMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    color: 'black', // Text color black
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});



// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   FlatList,
//   ScrollView,
//   Animated,
//   Modal,
//   TextInput,
// } from 'react-native';
// import {Searchbar, Button} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';

// const Dashboard = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [items, setItems] = useState([
//     {
//       id: '1',
//       name: 'Cappuccino',
//       amount: 90,
//       quantity: 0,
//       image:
//         'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRSa86J8qzFE-8hb2ekWRKgrSTxptuKBxOHZetAGzHFqa80TltrxDeeZQnJlDYOSxfdnJHTj7MnZAx0EpmYN5o5Fe6vVLYFziIijwtFv8zTi33rHsQpKwCj1w',
//     },
//     {
//       id: '2',
//       name: 'Choco Latte',
//       amount: 130,
//       quantity: 0,
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       id: '3',
//       name: 'Cold Brew',
//       amount: 140,
//       quantity: 0,
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       id: '4',
//       name: 'Latte',
//       amount: 110,
//       quantity: 0,
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       id: '5',
//       name: 'Matcha Latte',
//       amount: 140,
//       quantity: 0,
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       id: '6',
//       name: 'Sky Mocha',
//       amount: 120,
//       quantity: 0,
//       image: 'https://via.placeholder.com/150',
//     },
//   ]);
//   const [filteredItems, setFilteredItems] = useState(items);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const bottomSheetRef = useRef(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [newItemName, setNewItemName] = useState('');
//   const [newItemPrice, setNewItemPrice] = useState('');
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const onChangeSearch = query => {
//     setSearchQuery(query);
//     setFilteredItems(
//       items.filter(item =>
//         item.name.toLowerCase().includes(query.toLowerCase()),
//       ),
//     );
//   };

//   const handleAdd = id => {
//     const updatedItems = items.map(item =>
//       item.id === id ? {...item, quantity: item.quantity + 1} : item,
//     );
//     setItems(updatedItems);
//     setFilteredItems(updatedItems);
//     setSelectedItems(updatedItems.filter(item => item.quantity > 0));
//     bottomSheetRef.current.open();
//   };

//   const handleDelete = id => {
//     const updatedItems = items.map(item =>
//       item.id === id
//         ? {...item, quantity: Math.max(0, item.quantity - 1)}
//         : item,
//     );
//     setItems(updatedItems);
//     setFilteredItems(updatedItems);
//     const selected = updatedItems.filter(item => item.quantity > 0);
//     setSelectedItems(selected);
//     if (selected.length === 0) bottomSheetRef.current.close();
//   };

//   const getTotalQuantity = () =>
//     selectedItems.reduce((total, item) => total + item.quantity, 0);
//   const getTotalPrice = () =>
//     selectedItems.reduce(
//       (total, item) => total + item.quantity * item.amount,
//       0,
//     );

//   useEffect(() => {
//     loadItems();
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const loadItems = async () => {
//     try {
//       const storedItems = await AsyncStorage.getItem('items');
//       if (storedItems) {
//         const parsedItems = JSON.parse(storedItems);
//         setItems(parsedItems);
//         setFilteredItems(parsedItems);
//       }
//     } catch (error) {
//       console.error('Error loading items:', error);
//     }
//   };

//   const saveItems = async updatedItems => {
//     try {
//       await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
//     } catch (error) {
//       console.error('Error saving items:', error);
//     }
//   };

//   const addProduct = () => {
//     if (!newItemName.trim() || !newItemPrice.trim()) return;

//     const newItem = {
//       id: Date.now().toString(),
//       name: newItemName,
//       amount: parseFloat(newItemPrice),
//       quantity: 0, // Ensure the new product starts with quantity 0
//       image: 'https://via.placeholder.com/150',
//     };

//     const updatedItems = [...items, newItem];
//     setItems(updatedItems);
//     setFilteredItems(updatedItems);
//     setSelectedItems(updatedItems.filter(item => item.quantity > 0)); // Update selection
//     saveItems(updatedItems); // Save to AsyncStorage

//     setModalVisible(false);
//     setNewItemName('');
//     setNewItemPrice('');
//   };

//   const printReceipt = async (selectedItems, getTotalPrice) => {
//     try {
//       await BluetoothEscposPrinter.printText('\n', {});

//       // Print Store Name (Bold & Center)
//       await BluetoothEscposPrinter.printText('My Shop\n', {
//         encoding: 'GBK',
//         codepage: 0,
//         widthtimes: 2,
//         heighthtimes: 2,
//         align: BluetoothEscposPrinter.ALIGN.CENTER,
//       });

//       await BluetoothEscposPrinter.printText(
//         '--------------------------\n',
//         {},
//       );

//       // Print Items
//       for (let item of selectedItems) {
//         await BluetoothEscposPrinter.printText(`${item.name}\n`, {
//           encoding: 'GBK',
//           codepage: 0,
//           align: BluetoothEscposPrinter.ALIGN.LEFT,
//         });
//         await BluetoothEscposPrinter.printText(
//           `Qty: ${item.quantity}  x  Rs ${item.amount.toFixed(2)} = Rs ${(
//             item.quantity * item.amount
//           ).toFixed(2)}\n`,
//           {},
//         );
//       }

//       await BluetoothEscposPrinter.printText(
//         '--------------------------\n',
//         {},
//       );

//       // Print Total Amount
//       await BluetoothEscposPrinter.printText(
//         `Total: Rs ${getTotalPrice().toFixed(2)}\n`,
//         {
//           widthtimes: 2,
//           heighthtimes: 2,
//           align: BluetoothEscposPrinter.ALIGN.RIGHT,
//         },
//       );

//       await BluetoothEscposPrinter.printText('\n\n\n', {});
//     } catch (error) {
//       console.error('Print Error:', error);
//     }
//   };

//   const renderItem = ({item}) => (
//     <View style={styles.itemContainer}>
//       <Image source={{uri: item.image}} style={styles.itemImage} />
//       <Text style={styles.itemName}>{item.name}</Text>
//       <Text style={styles.itemAmount}>Rs {item.amount.toFixed(2)}</Text>
//       <View style={styles.itemActions}>
//         <TouchableOpacity
//           onPress={() => handleDelete(item.id)}
//           style={styles.iconButton}>
//           <Icon name="remove-circle" size={28} color="#FF3B30" />
//         </TouchableOpacity>
//         <Text style={styles.itemQuantity}>{item.quantity}</Text>
//         <TouchableOpacity
//           onPress={() => handleAdd(item.id)}
//           style={styles.iconButton}>
//           <Icon name="add-circle" size={28} color="#34C759" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Searchbar
//         placeholder="Search Items"
//         onChangeText={onChangeSearch}
//         value={searchQuery}
//         style={styles.searchBar}
//       />
//       <FlatList
//         data={filteredItems}
//         renderItem={renderItem}
//         keyExtractor={item => item.id}
//         numColumns={2}
//         contentContainerStyle={styles.grid}
//       />

//       <Animated.View
//         style={[styles.floatingButtonContainer, {opacity: fadeAnim}]}>
//         <TouchableOpacity
//           style={styles.floatingButton}
//           onPress={() => setModalVisible(true)}>
//           <Icon name="add" size={30} color="#fff" />
//           <Text style={styles.floatingButtonText}>Add Product</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add Product</Text>
//             <TextInput
//               placeholder="Item Name"
//               style={styles.input}
//               value={newItemName}
//               onChangeText={setNewItemName}
//             />
//             <TextInput
//               placeholder="Price"
//               keyboardType="numeric"
//               style={styles.input}
//               value={newItemPrice}
//               onChangeText={setNewItemPrice}
//             />
//             <View style={styles.modalButtons}>
//               <Button mode="contained" onPress={addProduct}>
//                 Add
//               </Button>
//               <Button
//                 mode="contained"
//                 color="red"
//                 onPress={() => setModalVisible(false)}>
//                 Cancel
//               </Button>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <RBSheet
//         ref={bottomSheetRef}
//         height={300}
//         openDuration={250}
//         customStyles={{container: styles.bottomSheet}}>
//         <ScrollView>
//           <Text style={styles.bottomSheetTitle}>Order Summary</Text>
//           <Text style={styles.summaryText}>
//             Total Items: {getTotalQuantity()}
//           </Text>
//           <Text style={styles.summaryText}>
//             Total Price: Rs {getTotalPrice().toFixed(2)}
//           </Text>
//           <View style={styles.bottomSheetButtons}>
//             <Button
//               mode="contained"
//               onPress={() => printReceipt(selectedItems, getTotalPrice)}
//               style={styles.sheetButton}>
//               Print
//             </Button>
//             <Button
//               mode="contained"
//               onPress={() => alert('Previewing...')}
//               style={styles.sheetButton}>
//               Preview
//             </Button>
//             <Button
//               mode="contained"
//               color="red"
//               onPress={() => alert('Deleted Order!')}
//               style={styles.sheetButton}>
//               Delete
//             </Button>
//           </View>
//         </ScrollView>
//       </RBSheet>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#F8F8F8', padding: 16},
//   searchBar: {marginBottom: 16, borderRadius: 10},
//   grid: {paddingBottom: 100},
//   itemContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 10,
//     padding: 15,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: {width: 0, height: 2},
//     elevation: 3,
//     margin: 8,
//     flex: 1,
//   },
//   itemImage: {width: 70, height: 70, borderRadius: 10, marginBottom: 8},
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   itemAmount: {fontSize: 14, color: '#666', marginBottom: 8},
//   itemActions: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
//   iconButton: {padding: 5},
//   itemQuantity: {marginHorizontal: 12, fontSize: 18, fontWeight: 'bold'},
//   bottomSheet: {padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20},
//   bottomSheetTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   summaryText: {fontSize: 16, textAlign: 'center', marginBottom: 5},
//   bottomSheetButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 15,
//   },
//   sheetButton: {flex: 1, marginHorizontal: 5, borderRadius: 10},

//   floatingButtonContainer: {position: 'absolute', bottom: 30, right: 20},
//   floatingButton: {
//     backgroundColor: '#ff6600',
//     padding: 15,
//     borderRadius: 50,
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   floatingButtonText: {color: '#fff', fontSize: 16, marginLeft: 10},
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//   },
//   modalButtons: {flexDirection: 'row', justifyContent: 'space-between'},
// });

// export default Dashboard;
