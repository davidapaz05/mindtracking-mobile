import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    minHeight: 380,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#ffffff',
  },
  title2: {
    fontSize: 16,
    color: '#ffffff',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 2,
  },
})