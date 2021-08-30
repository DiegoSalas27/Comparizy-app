import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import {useNavigation} from '@react-navigation/native';
// import * as FileSystem from 'expo-file-system'

//import * as tf from '@tensorflow/tfjs';
import * as tfc from '@tensorflow/tfjs-core';

import * as mobilenet from '@tensorflow-models/mobilenet';
import * as jpeg from 'jpeg-js';
import RNFS from 'react-native-fs';
import Toast from 'react-native-simple-toast';

import RNFetchBlob from "rn-fetch-blob";


//const navigation = useNavigation();

function decode_base64(s)
{
    var e = {}, i, k, v = [], r = '', w = String.fromCharCode;
    var n = [[65, 91], [97, 123], [48, 58], [43, 44], [47, 48]];

    for (z in n)
    {
        for (i = n[z][0]; i < n[z][1]; i++)
        {
            v.push(w(i));
        }
    }
    for (i = 0; i < 64; i++)
    {
        e[v[i]] = i;
    }

    for (i = 0; i < s.length; i+=72)
    {
        var b = 0, c, x, l = 0, o = s.substring(i, i+72);
        for (x = 0; x < o.length; x++)
        {
            c = e[o.charAt(x)];
            b = (b << 6) + c;
            l += 6;
            while (l >= 8)
            {
                r += w((b >>> (l -= 8)) &0xff);
            }
         }
    }
    return r;
}

class PictureScreen extends React.Component {
  state = {
    pausePreview: false,
    isTfReady: false,
    isModelReady: false,
    predictions: null,
    image: null,
  };

  async componentDidMount() {
    // await tf.ready();
    await tfc.ready();
    this.setState({
      isTfReady: true,
    });
    this.model = await mobilenet.load();
    this.setState({isModelReady: true});
  }

  imageToTensor(rawImageData) {
    const TO_UINT8ARRAY = true;
    const {width, height, data} = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }
    return tfc.tensor3d(buffer, [height, width, 3]);
  }

  classifyImage = async () => {
    try {
      console.log(this.state.image);
      // const imgB64 = await FileSystem.readAsStringAsync(this.state.image, {
      // encoding: FileSystem.EncodingType.Base64,
      // });

      var imgB64 = await RNFS.readFile(this.state.image, 'base64');

      // RNFS.readFile(uri, 'base64').then(imgB64 => {
      //   const imgBuffer = tfc.util.encodeString(imgB64, 'base64').buffer;
      //   //const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      //   const imageTensor = this.imageToTensor(imgBuffer);
      //   const predictions = this.model.classify(imageTensor);
      //   this.setState({predictions});
      //   console.log(predictions);
      // });

      // const imgBuffer = tfc.util.encodeString(imgB64, 'base64').buffer;
      const imgBuffer = decode_base64(imgB64);
      const imageTensor = this.imageToTensor(imgBuffer);
      const predictions = await this.model.classify(imageTensor)
      this.setState({ predictions })
      Toast.show(`${predictions}`, Toast.LONG);
      console.log(predictions)
    } catch (error) {
      Toast.show(`${error}`, Toast.LONG);
      console.log(error);
    }
  };

  render() {
    const {pausePreview} = this.state;
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
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>
          {({camera, status, recordAudioPermissionStatus}) => {
            if (status !== 'READY') {
              return <PendingView />;
            }
            return (
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                {pausePreview ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.resumePicture(camera)}>
                    <Text>Aceptar</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={() => this.takePicture(camera)}
                  style={styles.button}>
                  <Text style={{fontSize: 14}}> Tomar otra foto </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  takePicture = async function (camera) {
    const options = {quality: 0.5, base64: true};
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    
    const source = data.uri;

    // ~~~~~~~~
    const fs = RNFetchBlob.fs;

    RNFetchBlob.config({
      fileCache: true
    }).fetch("GET", "https://www.carlroth.com/medias/CT41-1000Wx1000H?context=bWFzdGVyfGltYWdlc3w4MzIwMnxpbWFnZS9qcGVnfGltYWdlcy9oNjQvaGQ0Lzg4MjU2NTUyNjMyNjIuanBnfDNjOTJkZWVkMjY0NzNkNTcwM2UwZmZmYzI5NmM3ZTBjOWQ3NWE3NmE2YTIwNTRkMDZmNTg5OGJmMjFjNmFkMTM")
    // the image is now dowloaded to device's storage
    .then(resp => {
    // the image path you can use it directly with Image component
      imagePath = resp.path();
      this.setState({ image: imagePath })
      return imagePath;

      
    });

    //~~~~~~~~~


    // this.setState({ image: source })
    
    this.classifyImage().then(() => {
      fs.unlink(path)
    });

    if (source) {
      await camera.pausePreview();
      console.log('picture source', source);
      this.setState({pausePreview: true});
    }
  };

  resumePicture = async function (camera) {
    await camera.resumePreview();
    this.setState({pausePreview: false});

    console.log('Going back to menu...');
    //navigation.navigate('HomeScreenWithSearch');
  };
}

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

export default PictureScreen;
