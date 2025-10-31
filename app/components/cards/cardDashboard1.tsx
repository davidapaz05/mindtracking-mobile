import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';



// --- ADIÇÃO: CorrelationsCard ---
type Correlation = {
  icon: ImageSourcePropType;
  color?: string;     // cor do ícone (verde/vermelho)
  text: string;       // ex: "Dias com 7h+ de sono: 4 dias"
};

type CorrelationsCardProps = {
  title?: string;     // default: "Correlações detectadas"
  items: Correlation[];
  testID?: string;
};

export const CorrelationsCard: React.FC<CorrelationsCardProps> = ({
  title = 'Correlações detectadas',
  items,
  testID,
}) => {
  const { width, height } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: w(6.93, width),            // ~26px (mesmo raio dos outros)
          paddingHorizontal: w(4.66, width),       // mesmo padding horizontal dos outros
          overflow: 'hidden',
        },
        topSpacer: { height: h(4.15, height) },    // ~34px
        title: {
          color: '#FFFFFF',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(18, width),                 // mantém 18 para ficar idêntico aos demais
        },
        list: {
          marginTop: h(2.2, height),               // ~18px entre título e lista
          rowGap: h(1.8, height),                  // espaço vertical entre itens
        },
        itemRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        itemIcon: {
          width: w(6.4, width),                    // ~24px
          height: w(6.4, width),
          marginRight: w(2.66, width),             // ~10px
          tintColor: '#16A34A',                    // default verde
        },
        itemText: {
          flex: 1,
          color: '#E5EAF0',
          fontFamily: 'Inter_500Medium',
          fontSize: fs(16, width),
          lineHeight: fs(20, width),
        },
        bottomSpacer: { height: h(3.41, height) }, // ~28px
      }),
    [width, height]
  );

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.topSpacer} />
      <Text style={styles.title}>{title}</Text>

      <View style={styles.list}>
        {items.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Image
              source={it.icon}
              style={[styles.itemIcon, it.color ? { tintColor: it.color } : null]}
            />
            <Text style={styles.itemText}>{it.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </View>
  );
};
// --- FIM DA ADIÇÃO ---

// Helpers compartilhados
const w = (v: number, width: number) => (width * v) / 100;   // width*
const h = (v: number, height: number) => (height * v) / 100; // height*
const fs = (px: number, width: number) => (px / 375) * width; // font scale simples

type Delta = 'up' | 'down' | 'none';

type StatCardProps = {
  title: string;
  value: number | string;
  deltaSign?: Delta;
  deltaText?: string;
  icon: ImageSourcePropType;
  testID?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  deltaSign = 'down', // Força visualização da seta para baixo
  deltaText,
  icon,
  testID,
}) => {
  const { width, height } = useWindowDimensions();

  // Estilos dependentes do tamanho devem ser memoizados para evitar recalcular a cada render
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: w(6.93, width),          // ≈ 26px em base 375
          paddingHorizontal: w(4.66, width),     // ≈ 10px
          overflow: 'hidden',
        },
        topSpacer: { height: h(4.15, height) },  // ≈ 34px
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        title: {
          color: '#FFFFFF',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(18, width),
        },
        icon: {
          width: w(8.53, width),                 // ≈ 32px
          height: w(8.53, width),
          resizeMode: 'contain',
          marginLeft: w(2, width),
          tintColor: '#fff',
        },
        gapHeader: { height: h(2.2, height) },   // ~18px de ar
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        value: {
          color: '#FFFFFF',
          fontFamily: 'Inter_700Bold',
          fontSize: fs(26, width),
          marginRight: w(2.66, width),
        },
        arrow: {
          width: w(3.8, width),                  // ~12px
          height: w(5.2, width),
          marginRight: w(1.6, width),
          tintColor: deltaSign === 'down' ? '#E11D48' : '#16A34A',
        },
        delta: {
          color: deltaSign === 'down' ? '#FCA5A5' : '#A7F3D0',
          fontFamily: 'Inter_500Medium',
          fontSize: fs(14, width),
        },
        bottomSpacer: { height: h(3.41, height) }, // ≈ 28px
      }),
    [width, height, deltaSign]
  );

  // Usa uma única seta e rotaciona quando "down"
  const arrowSource = require('@assets/icons/arrow.png');
  const arrowStyle = [
    styles.arrow,
    deltaSign === 'down' && { transform: [{ rotate: '180deg' }], tintColor: '#DB2626' },
    deltaSign === 'up' && { tintColor: '#22C45E' },
  ] as const;

  return (
    <View style={styles.card} accessibilityRole="summary" testID={testID}>
      <View style={styles.topSpacer} />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Image source={icon} style={styles.icon} />
      </View>

      <View style={styles.gapHeader} />

      <View style={styles.row}>
        <Text style={styles.value} accessibilityLabel={`${value}`}>{value}</Text>
        {deltaSign !== 'none' && <Image source={arrowSource} style={arrowStyle as any} />}
        {!!deltaText && <Text style={styles.delta}>{deltaText}</Text>}
      </View>

      <View style={styles.bottomSpacer} />
    </View>
  );
};

type InfoCardProps = {
  title: string;
  subtitle: string;
  icon: ImageSourcePropType;
  testID?: string;
};

export const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, icon, testID }) => {
  const { width, height } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: w(6.93, width),           // 26px responsivo como no StatCard
          paddingHorizontal: w(4.66, width),      // ≈ 10px
          overflow: 'hidden',
        },
        topSpacer: { height: h(4.15, height) },   // ≈ 34px
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        title: {
          color: '#FFFFFF',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(18, width),
        },
        icon: {
          width: w(8.53, width),                  // ≈ 32px
          height: w(8.53, width),
          resizeMode: 'contain',
          marginLeft: w(2, width),
          tintColor: undefined,                   // respeita cor original
        },
        gapTitleText: { height: h(1.22, height) },// ≈ 10px
        subtitle: {
          color: '#C9D3DC',
          fontFamily: 'Inter_500Medium',
          fontSize: fs(14, width),
          lineHeight: fs(18, width),
        },
        bottomSpacer: { height: h(3.41, height) },// ≈ 28px
      }),
    [width, height]
  );

  return (
    <View style={styles.card} accessibilityRole="summary" testID={testID}>
      <View style={styles.topSpacer} />
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Image source={icon} style={styles.icon} />
      </View>
      <View style={styles.gapTitleText} />
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.bottomSpacer} />
    </View>
  );
};

// --- Novo card: AthenaCard ---
type AthenaCardProps = {
  title?: string;
  description?: string;
  conversations?: number;
  onPress?: () => void;
  testID?: string;
};

export const AthenaCard: React.FC<AthenaCardProps> = ({
  title = 'Converse com a Athena',
  description = '12 conversas até agora.',
  conversations = 12,
  onPress,
  testID,
}) => {
  const { width, height } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: w(6.93, width),
          paddingHorizontal: w(4.66, width),
          paddingVertical: h(3, height),
          marginBottom: h(2, height),
        },
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        title: {
          color: '#fff',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(18, width),
        },
        // Padroniza o ícone igual aos primeiros cards
        icon: {
          width: w(8.53, width), // ≈ 32px
          height: w(8.53, width),
          resizeMode: 'contain',
          marginLeft: w(2, width),
          tintColor: '#fff',
        },
        description: {
          color: '#C9D3DC',
          fontFamily: 'Inter_400Regular',
          fontSize: fs(14, width),
          marginTop: h(1.3, height),
        },
        button: {
          marginTop: h(2, height),
          backgroundColor: '#2563EB',
          borderRadius: w(24, width),
          alignSelf: 'flex-start',
          paddingVertical: h(1.2, height),
          paddingHorizontal: w(6, width),
        },
        buttonText: {
          color: '#fff',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(16, width),
        },
      }),
    [width, height]
  );

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Image source={require('@assets/icons/chat.png')} style={styles.icon} />
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Comece Agora</Text>
      </View>
    </View>
  );
};

// --- Novo card: ExportarJornadaCard ---
type ExportarJornadaCardProps = {
  title?: string;
  description?: string;
  onPress?: () => void;
  testID?: string;
};

export const ExportarJornadaCard: React.FC<ExportarJornadaCardProps> = ({
  title = 'Exportar Jornada',
  description = 'Leve suas reflexões com você. Gere um arquivo PDF seguro para compartilhar com seu terapeuta ou guardar como um arquivo pessoal.',
  onPress,
  testID,
}) => {
  const { width, height } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: w(6.93, width),
          paddingHorizontal: w(4.66, width),
          paddingVertical: h(3, height),
        },
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        title: {
          color: '#fff',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(18, width),
        },
        // Padroniza o ícone igual aos primeiros cards
        icon: {
          width: w(8.53, width), // ≈ 32px
          height: w(8.53, width),
          resizeMode: 'contain',
          marginLeft: w(2, width),
          tintColor: '#fff',
        },
        description: {
          color: '#C9D3DC',
          fontFamily: 'Inter_400Regular',
          fontSize: fs(14, width),
          marginTop: h(1.3, height),
        },
        button: {
          marginTop: h(2, height),
          backgroundColor: '#2563EB',
          borderRadius: w(24, width),
          alignSelf: 'flex-start',
          paddingVertical: h(1.2, height),
          paddingHorizontal: w(7, width),
        },
        buttonText: {
          color: '#fff',
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs(16, width),
        },
      }),
    [width, height]
  );

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Image source={require('@assets/icons/recomendacao.png')} style={styles.icon} />
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Gerar Relatório em PDF</Text>
      </View>
    </View>
  );
};

