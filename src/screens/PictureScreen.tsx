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

export const PictureScreenFc: React.FC<PictureScreenProps> = ({route}) => {
  const navigation = useNavigation();

  async function takePicture(camera: RNCamera) {
    const options = {quality: 0.5, base64: true};
    await camera.takePictureAsync(options);

    const prediction = 'prediction';

    navigation.navigate('Comparizy', {prediction});
    // const source = data.uri;
    // if (source) {
    //   await camera.pausePreview();
    //   console.log("picture source", source);
    //   this.setState({ pausePreview:true })
    // }
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
