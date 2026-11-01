import { useRef } from 'react';
import { Button, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useScan } from '../src/store';

// Barcode scanner (SDK 58 CameraView API). On scan, the barcode is handed
// to the POS screen through the store and we go straight back.
export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);
  const setBarcode = useScan((s) => s.setBarcode);

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center', marginBottom: 12 }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={(result) => {
          if (scanned.current) return;
          scanned.current = true;
          setBarcode(result.data);
          router.back();
        }}
      />
      <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
          Point the camera at a barcode
        </Text>
      </View>
    </View>
  );
}
