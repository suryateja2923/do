import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TextInputProps,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { STATUS_COLORS } from '@/constants';

/**
 * Helper to retrieve light/dark active color palette
 */
export const useThemeColors = () => {
  const scheme = useColorScheme();
  return Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];
};

/**
 * 1. Button Component
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style = {},
}) => {
  const colors = useThemeColors();

  const buttonStyles: ViewStyle[] = [styles.btnBase, style];
  const textStyles: TextStyle[] = [styles.btnTextBase];

  if (variant === 'primary') {
    buttonStyles.push({ backgroundColor: '#6366f1' });
    textStyles.push({ color: '#ffffff' });
  } else if (variant === 'secondary') {
    buttonStyles.push({ backgroundColor: colors.backgroundElement });
    textStyles.push({ color: colors.text });
  } else if (variant === 'outline') {
    buttonStyles.push({
      borderWidth: 1,
      borderColor: colors.textSecondary + '30',
      backgroundColor: 'transparent',
    });
    textStyles.push({ color: colors.text });
  } else if (variant === 'danger') {
    buttonStyles.push({ backgroundColor: '#ef4444' });
    textStyles.push({ color: '#ffffff' });
  } else if (variant === 'ghost') {
    buttonStyles.push({ backgroundColor: 'transparent' });
    textStyles.push({ color: colors.textSecondary });
  }

  if (disabled || loading) {
    buttonStyles.push({ opacity: 0.5 });
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? '#ffffff' : colors.text} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * 2. Card Component
 */
interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style = {} }) => {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement }, style]}>
      {children}
    </View>
  );
};

/**
 * 3. Input Component
 */
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle = {},
  style = {},
  ...props
}) => {
  const colors = useThemeColors();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: error
              ? '#ef4444'
              : focused
              ? '#6366f1'
              : colors.textSecondary + '20',
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary + '80'}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

/**
 * 4. StatusBadge Component
 */
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();
  const color = (STATUS_COLORS as any)[normalized] || '#6b7280';

  return (
    <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <Text style={[styles.badgeText, { color }]}>{status.replace(/_/g, ' ')}</Text>
    </View>
  );
};

/**
 * 5. EmptyState Component
 */
interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  const colors = useThemeColors();
  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
};

/**
 * 6. Skeleton Component
 */
interface SkeletonProps {
  height?: number;
  width?: number | string;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ height = 20, width = '100%', style = {} }) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.skeleton,
        {
          backgroundColor: colors.backgroundSelected,
          height,
          width: typeof width === 'number' ? width : undefined,
        },
        typeof width === 'string' ? { width } : {},
        style,
      ] as any}
    />
  );
};

const styles = StyleSheet.create({
  btnBase: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  btnTextBase: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  inputContainer: {
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  inputError: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  skeleton: {
    borderRadius: 8,
    opacity: 0.6,
  },
});
