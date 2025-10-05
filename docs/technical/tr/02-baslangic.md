# Başlangıç Kılavuzu

Bu kılavuz, Retro App geliştirme ortamını kurmanıza ve uygulamayı yerel olarak çalıştırmanıza yardımcı olacaktır.

## Ön Koşullar

Başlamadan önce, aşağıdakilerin yüklü olduğundan emin olun:

- **Bun** 1.0.0 veya üzeri
- **Git** versiyon kontrolü için
- **Node.js** (opsiyonel, bazı araçlarla uyumluluk için)
- Bir **Supabase** hesabı (ücretsiz tier çalışır)
- Bir kod editörü (VS Code önerilir)

## Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd retro-app
```

### 2. Bağımlılıkları Yükleyin

Bu proje paket yöneticisi ve runtime olarak **Bun** kullanır:

```bash
bun install
```

### 3. Supabase'i Kurun

#### Supabase Projesi Oluşturun

1. [supabase.com](https://supabase.com) adresine gidin ve yeni bir proje oluşturun
2. Projenin hazırlanmasını bekleyin
3. Proje Ayarları → API'den proje URL'nizi ve anon key'inizi not edin

#### Veritabanı Tablolarını Kurun

Supabase SQL Editor'de aşağıdaki SQL'i çalıştırın:

```sql
-- teams tablosunu oluştur
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- retro_templates tablosunu oluştur
CREATE TABLE retro_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  template_columns JSON NOT NULL,
  cover_url TEXT,
  background_color TEXT,
  category_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- retros tablosunu oluştur
CREATE TABLE retros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled Retro',
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES retro_templates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- retro_comments tablosunu oluştur
CREATE TABLE retro_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID REFERENCES retros(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  comment TEXT DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security'yi etkinleştir
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_comments ENABLE ROW LEVEL SECURITY;

-- Policy'ler oluştur
CREATE POLICY "Kullanıcılar kendi takımlarını görebilir"
  ON teams FOR SELECT
  USING (id = (auth.jwt()->>'user_metadata')::json->>'team_id');

CREATE POLICY "Kullanıcılar kendi takımlarının retrolarını görebilir"
  ON retros FOR ALL
  USING (team_id = (auth.jwt()->>'user_metadata')::json->>'team_id');

CREATE POLICY "Kullanıcılar kendi takımlarının yorum

larını görebilir"
  ON retro_comments FOR ALL
  USING (
    retro_id IN (
      SELECT id FROM retros
      WHERE team_id = (auth.jwt()->>'user_metadata')::json->>'team_id'
    )
  );

-- Template'lere herkese okuma erişimi ver
CREATE POLICY "Herkes template'leri görebilir"
  ON retro_templates FOR SELECT
  USING (true);

-- Realtime'ı etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE retro_comments;
```

#### Örnek Template Ekleyin

```sql
INSERT INTO retro_templates (title, description, template_columns, cover_url)
VALUES (
  'Başla, Durdur, Devam Et',
  'Neye başlamalı, neyi durdurmalı ve neye devam etmeliyiz üzerine odaklanan klasik retrospektif formatı.',
  '[
    {
      "id": "start",
      "title": "Başla",
      "description": "Neye başlamalıyız?",
      "iconUrl": "/retro-column-icons/startStopContinue-start.png",
      "color": "#10b981"
    },
    {
      "id": "stop",
      "title": "Durdur",
      "description": "Neyi durdurmalıyız?",
      "iconUrl": "/retro-column-icons/startStopContinue-stop.png",
      "color": "#ef4444"
    },
    {
      "id": "continue",
      "title": "Devam Et",
      "description": "Neye devam etmeliyiz?",
      "iconUrl": "/retro-column-icons/startStopContinue-continue.png",
      "color": "#3b82f6"
    }
  ]'::json,
  '/retro-template-covers/startStopContinue.png'
);
```

### 4. Environment Variables'ı Yapılandırın

Proje kök dizininde bir `.env.local` dosyası oluşturun:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`your-project-url` ve `your-anon-key` değerlerini Supabase projenizden aldığınız değerlerle değiştirin.

### 5. Veritabanı Tiplerini Güncelleyin

Supabase şemanızdan TypeScript tipleri oluşturun:

```bash
bun supabase gen types typescript --project-id your-project-ref > src/lib/supabase/schema.ts
```

`your-project-ref` değerini Supabase proje referans ID'niz ile değiştirin.

## Uygulamayı Çalıştırma

### Geliştirme Sunucusu

Hot reload ile geliştirme sunucusunu başlatın:

```bash
bun run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde kullanılabilir olacaktır.

### Production için Build

Optimize edilmiş production build oluşturun:

```bash
bun run build
```

### Production Sunucusunu Başlatın

Production build'i çalıştırın:

```bash
bun run start
```

Sunucu varsayılan olarak 3000 portunda başlayacaktır.

## Geliştirme İş Akışı

### Proje Yapısında Gezinme

Ana dizinler ve amaçları:

- **`src/app/`**: Next.js sayfaları ve layout'ları (App Router)
- **`src/components/`**: React bileşenleri
- **`src/actions/`**: Veri mutasyonları için Server Action'lar
- **`src/queries/`**: TanStack Query kullanan istemci tarafı queries
- **`src/contexts/`**: React Context provider'lar
- **`src/lib/`**: Yardımcı araçlar, Supabase clientları ve yapılandırmalar

### Kod Stili

Proje şunları kullanır:

- **ESLint** linting için
- **Prettier** kod formatlama için

Linting çalıştırın:

```bash
bun run lint
```

### TypeScript

Tüm kod strict mode etkinleştirilmiş TypeScript ile yazılmıştır. Tipleri kontrol edin:

```bash
bun tsc --noEmit
```

## Sık Kullanılan Geliştirme Görevleri

### Yeni Sayfa Ekleme

1. `src/app/` içinde yeni bir klasör oluşturun
2. Bir `page.tsx` dosyası ekleyin
3. Varsayılan React bileşeni export edin

Örnek:

```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return <div>Sayfa İçeriğim</div>
}
```

### Server Action Oluşturma

1. `src/actions/` içine bir fonksiyon ekleyin
2. `'use server'` ile işaretleyin
3. Server tarafı Supabase clientını kullanın

Örnek:

```typescript
// src/actions/my-action.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function myAction() {
    const supabase = await createClient()
    // Mantığınız burada
}
```

### Client Query Oluşturma

1. `src/queries/` içine bir query/mutation ekleyin
2. TanStack Query hook'larını kullanın
3. Bileşeninizde import edin

Örnek:

```typescript
// src/queries/my-query.ts
import { useMutation } from '@tanstack/react-query'
import supabase from '@/lib/supabase/client'

export function useMyMutation() {
    return useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('my_table')
                .insert(data)

            if (error) throw error
            return result
        },
    })
}
```

## Sorun Giderme

### Port Zaten Kullanılıyor

3000 portu zaten kullanımdaysa:

```bash
# 3000 portundaki process'i öldür
lsof -ti:3000 | xargs kill -9

# Veya farklı bir port kullan
PORT=3001 bun run dev
```

### Supabase Bağlantı Sorunları

1. `.env.local` dosyanızın doğru değerlere sahip olduğunu doğrulayın
2. Supabase projenizin aktif olduğunu kontrol edin
3. Doğru proje URL'si ve anon key kullandığınızdan emin olun
4. Detaylı hata mesajları için tarayıcı konsolunu kontrol edin

### Şema Değişikliklerinden Sonra Tip Hataları

Veritabanını değiştirdikten sonra tipleri yeniden oluşturun:

```bash
bun supabase gen types typescript --project-id your-project-ref > src/lib/supabase/schema.ts
```

### Build Hataları

Next.js cache'ini temizleyin:

```bash
rm -rf .next
bun run build
```

## Sonraki Adımlar

Geliştirme ortamınız kurulduğuna göre:

1. Sistem tasarımını anlamak için [Mimari Kılavuzu](./03-mimari.md)'nu inceleyin
2. Auth akışını anlamak için [Kimlik Doğrulama Kılavuzu](./04-kimlik-dogrulama.md)'nu okuyun
3. Veritabanı kalıpları için [Veri Katmanı Kılavuzu](./05-veri-katmani.md)'nu keşfedin
4. UI geliştirme için [Bileşen Kılavuzu](./06-bilesenler.md)'nu kontrol edin

## Ek Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [TanStack Query Dokümantasyonu](https://tanstack.com/query)
- [Bun Dokümantasyonu](https://bun.sh/docs)
- [TypeScript Dokümantasyonu](https://www.typescriptlang.org/docs)
