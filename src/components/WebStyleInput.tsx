import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

interface WebStyleInputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
}

export default function WebStyleInput({ leftIcon, rightIcon, onRightIconPress, containerStyle, error, onFocus, onBlur, ...props }: WebStyleInputProps) {
  const isFocused = useSharedValue(0);

  const handleFocus = (e: any) => {
    isFocused.value = withTiming(1, { duration: 200 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    isFocused.value = withTiming(0, { duration: 200 });
    if (onBlur) onBlur(e);
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: error ? '#DC2626' : interpolateColor(
        isFocused.value,
        [0, 1],
        ['#DDDDDD', '#1F5B4E'] // Neutral gray to forest green
      ),
    };
  });

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      opacity: isFocused.value,
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Outer Ring Glow */}
      <Animated.View style={[styles.ring, animatedRingStyle]} pointerEvents="none" />
      
      {/* Input Box */}
      <Animated.View style={[styles.inputWrap, animatedBorderStyle, props.editable === false && { backgroundColor: '#f0f0f0' }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor="#6B7280"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} disabled={!onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 50, // Matches standard signup input height (login used 56, we can override via style if needed)
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'rgba(31, 91, 78, 0.25)', // Semi-transparent glow
    borderRadius: 20, // 16px inner + 4px stroke
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1F2937',
  },
});
