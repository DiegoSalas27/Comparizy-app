import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import {StackScreenProps} from '@react-navigation/stack';
import {StackNavigationProps} from '../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';

interface PictureScreenProps
  extends StackScreenProps<
    StackNavigationProps['ProductDetail'],
    'ProductDetail'
  > {}

export const PictureScreenFc: React.FC<PictureScreenProps> = () => {
  const navigation = useNavigation();

  async function takePicture(camera: RNCamera) {
    const options = {quality: 0.5, base64: true};
    const data = await camera.takePictureAsync(options);

    // const url = 'https://tf-webapp.herokuapp.com/predict/image';

    let formData = new FormData();
    formData.append('file', {
      uri: data.uri, // your file path string
      name: 'my_photo.jpg',
      type: 'image/jpg',
    });

    fetch('http://20.201.57.212:80/predict', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(response => {
        const prediction = response.class_name;

        navigation.navigate('Comparizy', {prediction});
      })
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        {({camera, status}) => {
          if (status !== 'READY') {
            return <PendingView />;
          }
          return (
            <View
              style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => takePicture(camera)}
                style={styles.button}>
                <Text style={{fontSize: 14}}> Tomar foto </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});
