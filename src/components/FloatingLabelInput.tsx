import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolateColor } from 'react-native-reanimated';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  errorText?: string;
  isPassword?: boolean;
  value: string;
}

export default function FloatingLabelInput({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  errorText,
  isPassword,
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  
  // 0 = resting (down), 1 = floating (up)
  const floatAnim = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    floatAnim.value = withTiming(isFocused || value ? 1 : 0, {
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isFocused, value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    setHasBeenTouched(true);
    if (onBlur) onBlur(e);
  };

  const labelStyle = useAnimatedStyle(() => {
    return {
      top: floatAnim.value === 1 ? -10 : 15,
      left: leftIcon ? (floatAnim.value === 1 ? 12 : 40) : 12,
      fontSize: floatAnim.value === 1 ? 12 : 16,
      color: errorText ? '#e74c3c' : (isFocused ? '#1F2937' : '#999'),
      backgroundColor: floatAnim.value === 1 ? '#fff' : 'transparent',
    };
  });

  const borderColor = isFocused 
    ? '#1F2937' 
    : '#ddd';

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        <TextInput
          style={styles.input}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {errorText && hasBeenTouched ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 54,
    backgroundColor: '#fff',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 4,
    fontFamily: 'Inter_400Regular',
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 16,
    paddingLeft: 40, // Space for left icon if it exists (handled by inline style in real app, but 40 is safe default here since we always have icons in login)
    zIndex: 2,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 3,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 3,
    padding: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    marginLeft: 4,
  },
});
