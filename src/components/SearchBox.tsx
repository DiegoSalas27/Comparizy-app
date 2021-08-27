import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { RNCamera } from 'react-native-camera';
import { Screen } from 'react-native-screens';
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation(); 
interface SearchBoxProps {
  onPress: (filterValue: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({onPress}) => {
  const [search, setSearch] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      setSearch('');
    }, []),
  );

  const clear = () => {
    setSearch('');
  };

  const handlePressPicture = () =>{
    console.log('Go to picture ');
    navigation.navigate('PictureScreen');
}

  return (
    <View style={styles.containerStyle}>
      <TextInput
        style={styles.input}
        onChangeText={setSearch}
        value={search}
        placeholder="Buscar Productos"
      />
      <View style={styles.searchIcon}>
        <TouchableOpacity onPress={clear}>
          <Icon name="close-outline" size={30} color="#C1C1C1" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onPress(search)}>
          <Icon name="search-outline" size={30} color="#C1C1C1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressPicture}>
          <Icon name="camera-outline" size={30} color="#C1C1C1" />
        </TouchableOpacity>
        
      </View>
    </View>
  );  
};

const styles = StyleSheet.create({
  containerStyle: {
    // marginHorizontal: 20,
    marginTop: 5,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C6',
  },
  searchIcon: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    top: 4,
    right: 0,
    zIndex: 999,
    elevation: 14,
  },
});
