import {FlashList} from '@shopify/flash-list';
import React, {forwardRef, useRef, useState} from 'react';
import {
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {generateItems} from './generateItems';

const CellContainer = forwardRef((props: ViewProps, ref: any) => {
  return <View ref={ref} {...props} />;
});

export const Flash = () => {
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
      <Pressable onPress={() => removeItem(item)}>
        <View style={{backgroundColor: item % 2 ? 'grey' : 'white'}}>
          <Text>Data: {item}</Text>
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
        disableAutoLayout
        CellRendererComponent={CellContainer}
      />
    </SafeAreaView>
  );
};
