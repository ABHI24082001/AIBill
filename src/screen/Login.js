import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('login');
  const [timer, setTimer] = useState(30);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  const otpInputs = useRef([]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const checkLoginStatus = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigation.replace('Drawer');
    } else {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    try {
      if (!confirm) {
        Alert.alert('Error', 'OTP confirmation object is missing.');
        return;
      }
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) {
        Alert.alert('Error', 'Please enter the complete OTP.');
        return;
      }

      const userCredential = await confirm.confirm(fullOtp);
      const userId = userCredential.user.uid;

      console.log('User ID:', userId);
      Alert.alert('Success', `OTP Verified Successfully!`);

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userId', userId);

      navigation.replace('Drawer', {user: userCredential.user});
    } catch (error) {
      console.error('OTP verification error:', error.code, error.message);
      Alert.alert(
        'Error',
        'Invalid OTP or verification failed. Please try again.',
      );
    }
  };

  const handleSignIn = async () => {
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      console.log('Attempting sign-in with:', fullPhoneNumber);

      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setConfirm(confirmation);
      setStep('otp');
      setTimer(30);
    } catch (error) {
      console.error('Sign-in error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleOtpChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value;

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus(); // Move to next input
    }
    setOtp(newOtp);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg',
        }}
        style={styles.image}
      />
      {step === 'login' ? (
        <>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your phone number</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Mobile number"
            placeholderTextColor="#000"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setStep('login')}
            style={styles.backButton}>
            <Icon name="arrowleft" size={40} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>OTP sent to +91-{phoneNumber}</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (otpInputs.current[index] = el)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                placeholderTextColor="#000"
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
              />
            ))}
          </View>
          <Text style={styles.timer}>
            {timer > 0
              ? `Retry in 00:${timer < 10 ? `0${timer}` : timer}`
              : 'Resend OTP'}
          </Text>
        </>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          (step === 'login' && phoneNumber.length !== 10) ||
          (step === 'otp' && otp.join('').length !== 6)
            ? styles.disabledButton
            : {},
        ]}
        onPress={step === 'login' ? handleSignIn : confirmCode}
        disabled={
          (step === 'login' && phoneNumber.length !== 10) ||
          (step === 'otp' && otp.join('').length !== 6)
        }>
        <Text style={styles.buttonText}>
          {step === 'login' ? 'Continue' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  image: {width: 250, height: 250, marginBottom: 20},
  title: {fontSize: 42, fontWeight: 'bold', marginBottom: 10, color: '#000'},
  subtitle: {fontSize: 20, color: '#000', marginBottom: 20},
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlign: 'center',
    color: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 5,
    borderRadius: 10,
    color: '#000',
  },
  timer: {fontSize: 14, color: '#000', marginBottom: 20},
  button: {
    backgroundColor: '#ff6600',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {color: '#000', fontSize: 16, fontWeight: 'bold'},
  disabledButton: {backgroundColor: '#ccc'},
  backButton: {alignSelf: 'flex-start', marginBottom: 10},
});

export default LoginScreen;
