import database, {FirebaseDatabaseTypes} from '@react-native-firebase/database';
import {useState} from 'react';
import {
  categories,
  groupCategories,
  prefix,
  subCategories,
} from '../common/contants';
import {urls} from '../common/urls';
import {Filter, IProduct} from '../interfaces/product';

let lastChild = {
  url: {
    [`${prefix}products/${groupCategories.TECNOLOGIA}/${categories.COMPUTADORAS}/${subCategories.LAPTOPS}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.TECNOLOGIA}/${categories.TELEVISORES}/${subCategories.OLED}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.TECNOLOGIA}/${categories.TELEVISORES}/${subCategories.QLED}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.ELECTROHOGAR}/${categories.COCINA}/${subCategories.COCINA_DE_PIE}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.ELECTROHOGAR}/${categories.LAVADO}/${subCategories.LAVADORAS}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.ELECTROHOGAR}/${categories.LAVADO}/${subCategories.SECADORAS}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
    [`${prefix}products/${groupCategories.ELECTROHOGAR}/${categories.REFRIGERACION}/${subCategories.REFIGERADORAS}`]:
      {
        product_name_key: '',
        sub_category_key: '',
        brand_key: '',
        pricekey: '',
      },
  },
};
// let reachedBottom = false;

const filterMap = async (
  filter: string,
  filters: Filter[],
  limit: number,
  low: number,
  high: number,
  loadMore?: boolean,
): Promise<{response: FirebaseDatabaseTypes.DataSnapshot[][], errorFound: boolean}> => {
  let response: FirebaseDatabaseTypes.DataSnapshot[][];
  let errorFound = false;

  response = await Promise.all(
    filters.map(async filterProp => {
      if (loadMore) {
        return (await Promise.all(
          urls.map(async url => {
            try {
              if (filterProp == 'pricekey') {
                if (lastChild.url[url][filterProp] !== '') {
                  return await database()
                    .ref(url)
                    .orderByChild(filterProp)
                    .startAt(lastChild.url[url][filterProp])
                    .endAt(high.toLocaleString() + '\uf8ff')
                    .limitToFirst(limit)
                    .once('value');
                }
             
              } else {
                if (lastChild.url[url][filterProp] !== '') {
                  return await database()
                    .ref(url)
                    .orderByChild(filterProp)
                    .startAt(lastChild.url[url][filterProp])
                    .endAt(filter.toUpperCase() + '\uf8ff')
                    .limitToFirst(limit)
                    .once('value');
                }
              }
            } catch (error) {
              errorFound = true;
            }
          }),
        )) as FirebaseDatabaseTypes.DataSnapshot[];
      } else {
        return (await Promise.all(
          urls.map(async url => {
            try {
              if (filterProp == 'pricekey') {
                return await database()
                .ref(url)
                .orderByChild(filterProp)
                .startAt(low.toLocaleString())
                .endAt(high.toLocaleString() + '\uf8ff')
                .limitToFirst(limit)
                .once('value');
              } else {
                return await database()
                .ref(url)
                .orderByChild(filterProp)
                .startAt(filter.toUpperCase()) // includes string
                .endAt(filter.toUpperCase() + '\uf8ff')
                .limitToFirst(limit)
                .once('value');
              }
            } catch (error) {
              errorFound = true;
            }
          }),
        )) as FirebaseDatabaseTypes.DataSnapshot[];
      }
    }),
  );

  return {response, errorFound};
};

export const useFilteredProducts = (limit: number) => {
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [reachedBottom, setReachedBottom] = useState<boolean>(false);

  const FilterElements = (word: string, filter: string) => {
    var word_filters = filter.split(' ');
    for (let word_filter of word_filters) {
      if (word.toLowerCase().includes(word_filter.toLowerCase())) return true;
    }
  }

  const loadFilteredProducts = async (
    filter: string,
    low: number,
    high: number,
    loadMore?: boolean,
  ) => {
    const { response, errorFound } = await filterMap(
      filter,
      ['product_name_key', 'brand_key', 'sub_category_key', 'pricekey'],
      limit,
      low,
      high,
      loadMore,
    );

    if (errorFound) {
      setReachedBottom(true);
    }

    let finalResponse: FirebaseDatabaseTypes.DataSnapshot[] = [];

    response.map(resArr => {
      resArr.map(res => {
        if (res && res.hasChildren()) {
          finalResponse.push(res);
        }
      });
    });

    let products: IProduct[] = [];

    if (finalResponse.length == 0) setReachedBottom(true);

    finalResponse.forEach(
      (snapshot: FirebaseDatabaseTypes.DataSnapshot, index: number) => {
        snapshot.forEach((data: any): any => {
          lastChild.url[`/${(snapshot.ref as any).path.toString()}`][
            'product_name_key'
          ] = (data.val() as IProduct).product_name_key;
          lastChild.url[`/${(snapshot.ref as any).path.toString()}`][
            'brand_key'
          ] = (data.val() as IProduct).brand_key;
          lastChild.url[`/${(snapshot.ref as any).path.toString()}`][
            'sub_category_key'
          ] = (data.val() as IProduct).sub_category_key;
          lastChild.url[`/${(snapshot.ref as any).path.toString()}`][
            'pricekey'
          ] = (data.val() as IProduct).pricekey;

          const eachP = data.val() as IProduct;
          const priceFloat = parseFloat(eachP.product_price.replace(/,/g, ''));

          if (priceFloat >= low && priceFloat <= high) {
            if (
              FilterElements(eachP.brand, filter) ||
              FilterElements(eachP.product_name, filter) ||
              FilterElements(eachP.sub_category, filter)
            ) {
              const exists = products.find(
                prod =>
                  prod.model_store_unique_identifier ==
                  (data.val() as IProduct).model_store_unique_identifier,
              );
              !exists && products.push(data.val());
            }
          }
        });
      },
    );
    setFilteredProducts(oldArray => {
      var ids = new Set(oldArray.map(d => d.model_store_unique_identifier));
      const differenceQuantity = products.filter(
        d => !ids.has(d.model_store_unique_identifier),
      ).length;
      if (differenceQuantity == 0) setReachedBottom(true);
      var merged = [
        ...oldArray,
        ...products.filter(d => !ids.has(d.model_store_unique_identifier)),
      ];
      return merged;
    });
  };

  return {
    setReachedBottom,
    reachedBottom,
    filteredProducts,
    loadFilteredProducts,
    setFilteredProducts,
  };
};
