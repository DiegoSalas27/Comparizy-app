
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
//import {UPLOAD_PROGRESS_HEADER} from './Constants';

// import * as FileSystem from 'expo-file-system'

//import * as tfc from '@tensorflow/tfjs-core';
//import * as mobilenet from '@tensorflow-models/mobilenet';

//import * as tf from '@tensorflow/tfjs';
//import '@tensorflow/tfjs-react-native';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';

import * as jpeg from 'jpeg-js';
import RNFS from 'react-native-fs';
import Toast from 'react-native-simple-toast';

import RNFetchBlob from "rn-fetch-blob";

//const [uploadProgress, setUploadProgress] = useState(0);
//const [response, setResponse] = useState('You should see your response here');
let photoUri ='';
let ImageUri ='';
let APIurl='https://inceptionv2api.herokuapp.com/predict/image?filename=%20https%3A%2F%2Fi.imgur.com%2F'
let url='';


global.atob = require("atob");
//global.Blob = require('node-blob');


//https://i.imgur.com/ZlP297u.jpeg
_postData =async() => {
  var formBody = [];
    //POST request
    fetch(APIurl+ImageUri, {
      method: 'POST', //Request Type
      body: formBody, //post body
      headers: {
        //Header Defination
        'Content-Type': 
          'application/x-www-form-urlencoded;charset=UTF-8',
      },
    })
      .then((response) => response.json())
      //If response is in json then in success
      .then((responseJson) => {
        alert(JSON.stringify(responseJson));
        console.log("GOOO")
        console.log(responseJson);
      })
      //If response is not in json then in error
      .catch((error) => {
        alert(JSON.stringify(error));
        console.error(error);
      });
  };





/*.then((response)=>response.json())
  .then((responseJson=>{this.setState(text: JSON.stringify(responseJson)))})
    
  
*/


const onClickUpload = () => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  console.log("ENTRO :")
  formData.append('image', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  xhr.upload.addEventListener('progress', handleProgress);
  xhr.addEventListener('load', () => {
   // setUploadProgress(100);Ñ
   // setResponse(xhr.response);
    console.log("El response es :")
    console.log(xhr.response)
    var result = JSON.parse(xhr.response);
    console.log("EL LINK ES :")
    console.log(result.data.link);
    ImageUri=result.data.link;
    url=ImageUri.substring(20)
    console.log(url);
    ImageUri=url;
    console.log(APIurl+ImageUri)
// now you can access it's params:
    _postData();
  });
  xhr.open('POST', 'https://api.imgur.com/3/upload');
  xhr.setRequestHeader('Authorization', 'MIIDD');
  xhr.send(formData);
};
const handleProgress = event => {
 // setUploadProgress(Math.round((event.loaded * 100) / event.total));
  console.log(Math.round((event.loaded * 100) / event.total));
};


function _base64ToArrayBuffer(base64) {
  var binary_string = global.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

//const navigation = useNavigation();

class PictureScreen extends React.Component {
  state = {
    pausePreview: false,
    isTfReady: false,
    isModelReady: false,
    predictions: null,
    image: null,
  };

  async componentDidMount() {
    try {
    // await tf.ready();
    await tf.ready();
    // this.setState({
    //   isTfReady: true,
    // });
    console.log('arroz');
    this.model = await mobilenet.load();
    this.setState({isModelReady: true});
    } catch (error) {
      Toast.show(`${error}`, Toast.LONG);
      console.log(error);
    }
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
    return tf.tensor3d(buffer, [height, width, 3]);
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

      //const imgBuffer = tfc.util.encodeString(imgB64, 'base64').buffer;
      const imgBuffer = _base64ToArrayBuffer(imgB64);
      //const imgBuffer = Buffer.from(imgB64);

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
    //  eslint-disable-next-lineA
    
    const source = data.uri;
    photoUri=source;
    console.log("AVANZO :");
    onClickUpload();
    
 //   
   // console.log("ES UN :");
   // console.log(Clasf.data);
    // ~~~~~~~~
    // const fs = RNFetchBlob.fs;

    // RNFetchBlob.config({
    //   fileCache: true
    // }).fetch("GET", "https://www.carlroth.com/medias/CT41-1000Wx1000H?context=bWFzdGVyfGltYWdlc3w4MzIwMnxpbWFnZS9qcGVnfGltYWdlcy9oNjQvaGQ0Lzg4MjU2NTUyNjMyNjIuanBnfDNjOTJkZWVkMjY0NzNkNTcwM2UwZmZmYzI5NmM3ZTBjOWQ3NWE3NmE2YTIwNTRkMDZmNTg5OGJmMjFjNmFkMTM")
    // .then(resp => {
    //   imagePath = resp.path();
    //   this.setState({ image: imagePath })
    //   this.classifyImage().then(() => {
    //     fs.unlink(imagePath)
    //   });
    // });

    //~~~~~~~~~


    this.setState({ image: source })
    this.classifyImage();
    

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
//
export default PictureScreen;