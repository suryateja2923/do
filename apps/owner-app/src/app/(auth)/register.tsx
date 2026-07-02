import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, useThemeColors } from '@/shared';
import { useAuthStore } from '@/store/authStore';
import { Spacing } from '@/constants/theme';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react-native';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  // Steps: 1 = Personal, 2 = Business, 3 = Documents
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');

  const [businessName, setBusinessName] = useState('');
  const [pgName, setPgName] = useState('');
  const [businessType, setBusinessType] = useState<'BOYS_PG' | 'GIRLS_PG' | 'HOSTEL' | 'CO_LIVING'>('CO_LIVING');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Documents paths using Expo DocumentPicker
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [propertyUrl, setPropertyUrl] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  // Document names for UI display
  const [aadhaarName, setAadhaarName] = useState('');
  const [panName, setPanName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [profileName, setProfileName] = useState('');

  const handlePickDocument = async (type: 'aadhaar' | 'pan' | 'property' | 'profile') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'profile' ? 'image/*' : '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name;
        
        if (type === 'aadhaar') setAadhaarName(fileName);
        else if (type === 'pan') setPanName(fileName);
        else if (type === 'property') setPropertyName(fileName);
        else if (type === 'profile') setProfileName(fileName);

        // Fetch local URI and convert to portable base64 data URL
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          if (type === 'aadhaar') setAadhaarUrl(base64data);
          else if (type === 'pan') setPanUrl(base64data);
          else if (type === 'property') setPropertyUrl(base64data);
          else if (type === 'profile') setProfileUrl(base64data);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick document: ' + err.message);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      fullName,
      mobile,
      email,
      password,
      dob,
      gender,
      businessName,
      pgName,
      businessType,
      address,
      city,
      state,
      pincode,
      documents: {
        id_url: aadhaarUrl,
        pan_url: panUrl,
        property_proof_url: propertyUrl,
        profile_photo_url: profileUrl,
      },
    };

    try {
      // POST API call to register
      const response: any = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
      if (response && response.data) {
        const { token, user, ownerProfile } = response.data;
        setSession(token, user, ownerProfile);
      }
    } catch (err: any) {
      console.log('Registration submission failed:', err.message);
      Alert.alert('Registration Failed', err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((num) => (
            <View
              key={num}
              style={[
                styles.indicatorDot,
                { backgroundColor: step >= num ? '#6366f1' : colors.backgroundElement },
              ]}
            >
              <Text style={[styles.indicatorText, { color: step >= num ? '#ffffff' : colors.text }]}>
                {num}
              </Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={[styles.title, { color: colors.text }]}>Personal Information</Text>
            <Input label="Full Name" placeholder="e.g. John Doe" value={fullName} onChangeText={setFullName} />
            <Input label="Mobile Number" placeholder="e.g. 9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Input label="Email Address" placeholder="e.g. business@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Input label="Password" placeholder="Create a secure password (min. 8 chars)" secureTextEntry value={password} onChangeText={setPassword} />
            <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />
            
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Gender</Text>
            <View style={styles.row}>
              {['MALE', 'FEMALE', 'OTHER'].map((gen) => (
                <TouchableOpacity
                  key={gen}
                  onPress={() => setGender(gen)}
                  style={[
                    styles.radioBtn,
                    {
                      borderColor: gender === gen ? '#6366f1' : colors.textSecondary + '20',
                      backgroundColor: gender === gen ? '#6366f110' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.radioText, { color: gender === gen ? '#6366f1' : colors.textSecondary }]}>
                    {gen}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Continue" onPress={handleNext} style={styles.navBtn} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={[styles.title, { color: colors.text }]}>Business & Location</Text>
            <Input label="Business Name" placeholder="e.g. Homie Co-living LLC" value={businessName} onChangeText={setBusinessName} />
            <Input label="PG Name" placeholder="e.g. Homie Elite Boys PG" value={pgName} onChangeText={setPgName} />
            
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Business Type</Text>
            <View style={styles.rowWrap}>
              {['BOYS_PG', 'GIRLS_PG', 'HOSTEL', 'CO_LIVING'].map((type: any) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setBusinessType(type)}
                  style={[
                    styles.radioBtn,
                    {
                      borderColor: businessType === type ? '#6366f1' : colors.textSecondary + '20',
                      backgroundColor: businessType === type ? '#6366f110' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.radioText, { color: businessType === type ? '#6366f1' : colors.textSecondary }]}>
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Street Address" placeholder="e.g. 123 Main Road" value={address} onChangeText={setAddress} />
            <Input label="City" placeholder="e.g. Bengaluru" value={city} onChangeText={setCity} />
            <Input label="State" placeholder="e.g. Karnataka" value={state} onChangeText={setState} />
            <Input label="Pincode" placeholder="e.g. 560001" value={pincode} onChangeText={setPincode} keyboardType="number-pad" />

            <View style={styles.btnRow}>
              <Button title="Back" onPress={handleBack} variant="outline" style={{ flex: 1 }} />
              <Button title="Continue" onPress={handleNext} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={[styles.title, { color: colors.text }]}>Document Uploads</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please upload the required documents to verify your PG business.
            </Text>

            {/* Aadhaar Box */}
            <View style={[styles.uploadBox, { backgroundColor: colors.backgroundElement }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, { color: colors.text, fontWeight: '700' }]}>Aadhaar Card (PDF / JPG)</Text>
                {aadhaarName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={[styles.uploadPath, { color: colors.text }]} numberOfLines={1}>
                      {aadhaarName}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadPath, { color: colors.textSecondary, marginTop: 4 }]}>
                    No file selected
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handlePickDocument('aadhaar')}
                style={[styles.pickerBtn, { backgroundColor: '#6366f1' }]}
              >
                {aadhaarUrl ? (
                  <RefreshCw size={14} color="#ffffff" />
                ) : (
                  <Upload size={14} color="#ffffff" />
                )}
                <Text style={styles.pickerBtnText}>{aadhaarUrl ? 'Change' : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            {/* PAN Box */}
            <View style={[styles.uploadBox, { backgroundColor: colors.backgroundElement }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, { color: colors.text, fontWeight: '700' }]}>PAN Card (PDF / JPG)</Text>
                {panName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={[styles.uploadPath, { color: colors.text }]} numberOfLines={1}>
                      {panName}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadPath, { color: colors.textSecondary, marginTop: 4 }]}>
                    No file selected
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handlePickDocument('pan')}
                style={[styles.pickerBtn, { backgroundColor: '#6366f1' }]}
              >
                {panUrl ? (
                  <RefreshCw size={14} color="#ffffff" />
                ) : (
                  <Upload size={14} color="#ffffff" />
                )}
                <Text style={styles.pickerBtnText}>{panUrl ? 'Change' : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            {/* Property Proof Box */}
            <View style={[styles.uploadBox, { backgroundColor: colors.backgroundElement }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, { color: colors.text, fontWeight: '700' }]}>Property Ownership Proof (Tax / Bill)</Text>
                {propertyName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={[styles.uploadPath, { color: colors.text }]} numberOfLines={1}>
                      {propertyName}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadPath, { color: colors.textSecondary, marginTop: 4 }]}>
                    No file selected
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handlePickDocument('property')}
                style={[styles.pickerBtn, { backgroundColor: '#6366f1' }]}
              >
                {propertyUrl ? (
                  <RefreshCw size={14} color="#ffffff" />
                ) : (
                  <Upload size={14} color="#ffffff" />
                )}
                <Text style={styles.pickerBtnText}>{propertyUrl ? 'Change' : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Photo Box */}
            <View style={[styles.uploadBox, { backgroundColor: colors.backgroundElement }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, { color: colors.text, fontWeight: '700' }]}>Profile Photo (PNG / JPG)</Text>
                {profileName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={[styles.uploadPath, { color: colors.text }]} numberOfLines={1}>
                      {profileName}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.uploadPath, { color: colors.textSecondary, marginTop: 4 }]}>
                    No file selected
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handlePickDocument('profile')}
                style={[styles.pickerBtn, { backgroundColor: '#6366f1' }]}
              >
                {profileUrl ? (
                  <RefreshCw size={14} color="#ffffff" />
                ) : (
                  <Upload size={14} color="#ffffff" />
                )}
                <Text style={styles.pickerBtnText}>{profileUrl ? 'Change' : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.btnRow}>
              <Button title="Back" onPress={handleBack} variant="outline" style={{ flex: 1 }} />
              <Button title="Submit Application" onPress={handleSubmit} loading={loading} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  indicatorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepCard: {
    gap: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  radioBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  radioText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navBtn: {
    marginTop: Spacing.three,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  uploadBox: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadPath: {
    fontSize: 11,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
