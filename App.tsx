import {FlashList} from '@shopify/flash-list';
import React, {ReactNode, useRef, useState} from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';

const generateItems = (n: number): Array<number> => {
  return Array.from(Array(n)).map((_, i) => {
    return i;
  });
};

enum ViewTypes {
  GREY = 'grey',
  WHITE = 'white',
}

const {width} = Dimensions.get('window');

const layoutProvider = new LayoutProvider(
  index => (index % 2 ? ViewTypes.GREY : ViewTypes.WHITE),
  (_, dim) => {
    // this part is ignored when forceNonDeterministicRendering is true
    dim.height = 50;
    dim.width = width;
  },
);

const dataProvider = new DataProvider((r1, r2) => {
  return r1 !== r2;
}).cloneWithRows(generateItems(10000));

let counter = 0;

const CellContainer = ({
  type,
  children,
}: {
  type: 'grey' | 'white';
  children: ReactNode;
}) => {
  const count = useRef(counter++);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: type,
      }}>
      <Text>{count.current}</Text>
      {children}
    </View>
  );
};

const rowRender = (viewTypes: string | number, data: number) => {
  switch (viewTypes) {
    case ViewTypes.GREY:
      return (
        <CellContainer type="grey">
          <Text>Data: {data}</Text>
        </CellContainer>
      );
    case ViewTypes.WHITE:
      return (
        <CellContainer type="white">
          <Text>Data: {data}</Text>
        </CellContainer>
      );
    default:
      return null;
  }
};

const Recycler = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <RecyclerListView
        layoutProvider={layoutProvider}
        dataProvider={dataProvider}
        rowRenderer={rowRender}
        forceNonDeterministicRendering
      />
    </SafeAreaView>
  );
};

const Flash = () => {
  const [data, setData] = useState(generateItems(1000));

  const list = useRef<FlashList<number> | null>(null);

  const removeItem = (item: number) => {
    setData(
      data.filter(dataItem => {
        return dataItem !== item;
      }),
    );
    // This must be called before `LayoutAnimation.configureNext` in order for the animation to run properly.
    list.current?.prepareForLayoutAnimationRender();
    // After removing the item, we can start the animation.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({item}: {item: number; index: number}) => {
    return (
      <Pressable
        style={{
          backgroundColor: item % 2 ? 'grey' : 'white',
        }}
        onPress={() => {
          removeItem(item);
        }}>
        <View
          style={{
            padding: 16,
          }}>
          <Text>Cell Id: {item}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <FlashList
        // Saving reference to the `FlashList` instance to later trigger `prepareForLayoutAnimationRender` method.
        ref={list}
        // This prop is necessary to uniquely identify the elements in the list.
        keyExtractor={(item: number) => {
          return item.toString();
        }}
        renderItem={renderItem}
        estimatedItemSize={50}
        data={data}
      />
    </SafeAreaView>
  );
};

export default Recycler;
