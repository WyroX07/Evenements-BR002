# Diagnostic et Améliorations - Système d'envoi d'emails

## 📋 Résumé de l'analyse

### Problème signalé
- **Commande 00006** : Paiement par virement, adresse email Skynet
- **Symptôme** : Aucune trace de l'email sur Resend
- **Commande 00005** : Email parti avec succès (adresse Gmail)

---

## 🔍 Problèmes identifiés dans le code actuel

### 1. Logging insuffisant (RÉSOLU ✅)

**Avant** :
```typescript
sendOrderConfirmation(emailData).catch((error) => {
  console.error('Erreur envoi email confirmation:', error)
})
```

**Problème** :
- Pas de log en cas de succès
- Pas d'ID de l'email Resend loggé
- Impossible de tracer l'email

**Solution appliquée** :
- ✅ Ajout de logs détaillés dans `lib/emails.ts`
- ✅ Ajout de logs dans `app/api/orders/route.ts`
- ✅ Logging de l'ID Resend pour tracking

### 2. Envoi asynchrone sans feedback

**Problème** :
- L'API retourne succès même si l'email échoue
- Aucune information n'est stockée en base de données
- L'utilisateur ne sait pas si l'email est parti

**Recommandation** :
Ajouter une table `email_logs` dans Supabase pour tracer tous les envois.

---

## 🧪 Tests à effectuer

### 1. Tester l'envoi avec le script de débogage

```bash
# Tester avec une adresse Skynet
npx tsx scripts/test-email.ts votre-email@skynet.be

# Tester avec une adresse Gmail
npx tsx scripts/test-email.ts votre-email@gmail.com

# Tester avec d'autres fournisseurs
npx tsx scripts/test-email.ts votre-email@hotmail.com
npx tsx scripts/test-email.ts votre-email@outlook.com
```

### 2. Vérifier les logs serveur

Avec les améliorations apportées, vous devriez maintenant voir dans les logs :

**En cas de succès** :
```
[sendOrderConfirmation] Début envoi email: { orderCode: 'ORD-...', to: '...', ... }
[sendOrderConfirmation] ✅ Email envoyé avec succès: { emailId: 're_...', duration: '234ms' }
[POST /api/orders] ✅ Email confirmation envoyé: { orderCode: '...', emailId: 're_...' }
```

**En cas d'échec** :
```
[sendOrderConfirmation] Début envoi email: { orderCode: 'ORD-...', to: '...', ... }
[sendOrderConfirmation] ❌ Erreur envoi email: { error: { message: '...', name: '...', stack: '...' } }
[POST /api/orders] ⚠️ Échec envoi email (commande créée): { error: '...' }
```

### 3. Vérifier sur le dashboard Resend

1. Connexion : https://resend.com/emails
2. Chercher l'email par :
   - Date de création de la commande
   - Adresse destinataire
   - ID de l'email (maintenant loggé)

**Statuts possibles** :
- ✅ **Delivered** : Email livré avec succès
- ⏳ **Queued** : En attente d'envoi
- 🔄 **Processing** : En cours de traitement
- ❌ **Failed** : Échec d'envoi
- 📧 **Bounced** : Email rejeté par le destinataire
- 🚫 **Blocked** : Bloqué (spam, mauvaise réputation)

---

## 🐛 Causes possibles pour Skynet

### 1. Filtres anti-spam de Skynet
Skynet (Proximus) a des filtres anti-spam très stricts. Possibilités :
- L'email est arrivé dans les spams
- L'email a été bloqué par le serveur Skynet
- Délai de livraison plus long

### 2. Configuration SPF/DKIM/DMARC

Vérifier la configuration DNS de `scouts-ecaussinnes.be` :

```bash
# Vérifier les enregistrements SPF
nslookup -type=TXT scouts-ecaussinnes.be

# Vérifier DKIM (à adapter selon Resend)
nslookup -type=TXT resend._domainkey.scouts-ecaussinnes.be

# Vérifier DMARC
nslookup -type=TXT _dmarc.scouts-ecaussinnes.be
```

**Action recommandée** :
- Vérifier sur le dashboard Resend si le domaine est correctement configuré
- Aller dans Settings → Domains → scouts-ecaussinnes.be
- Vérifier que tous les enregistrements DNS sont validés (✅)

### 3. Taux d'envoi et réputation

Resend applique des limites selon votre plan :
- **Free tier** : 100 emails/jour, 3000/mois
- **Pro tier** : Illimité

Si vous dépassez les limites, les emails peuvent être mis en queue ou rejetés.

### 4. Format de l'adresse email

Vérifier que l'adresse Skynet est valide :
```
✅ Valide : user@skynet.be
❌ Invalide : user@skynet.com (doit être .be)
```

---

## 🛠️ Améliorations recommandées

### 1. Ajouter une table de logs d'emails

**Migration Supabase** :
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_code VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  resend_email_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_email_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

**Modifier `lib/emails.ts`** :
```typescript
export async function sendOrderConfirmation(
  data: OrderConfirmationData,
  orderId: string // Ajouter l'ID de la commande
) {
  // ... code existant ...

  try {
    const response = await resend.emails.send({ ... })

    // Enregistrer le succès en base
    await supabase.from('email_logs').insert({
      order_id: orderId,
      order_code: data.orderCode,
      recipient_email: data.customerEmail,
      resend_email_id: response.id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return { success: true, response }
  } catch (error) {
    // Enregistrer l'échec en base
    await supabase.from('email_logs').insert({
      order_id: orderId,
      order_code: data.orderCode,
      recipient_email: data.customerEmail,
      status: 'failed',
      error_message: error instanceof Error ? error.message : String(error),
    })

    return { success: false, error }
  }
}
```

### 2. Ajouter un webhook Resend pour tracking

Resend peut envoyer des webhooks pour notifier des événements :
- `email.sent`
- `email.delivered`
- `email.bounced`
- `email.complained` (marqué comme spam)

**Créer la route** : `app/api/webhooks/resend/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const payload = await request.json()

  // Vérifier la signature (sécurité)
  // const signature = request.headers.get('svix-signature')
  // ... validation

  const { type, data } = payload

  // Mettre à jour le statut dans email_logs
  await supabase
    .from('email_logs')
    .update({
      status: type.replace('email.', ''), // 'delivered', 'bounced', etc.
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', data.email_id)

  return NextResponse.json({ success: true })
}
```

**Configurer sur Resend** :
1. Aller dans Settings → Webhooks
2. Ajouter : `https://evenements.scouts-ecaussinnes.be/api/webhooks/resend`
3. Sélectionner les événements à suivre

### 3. Ajouter un mécanisme de retry

Si l'envoi échoue, réessayer automatiquement :

```typescript
async function sendOrderConfirmationWithRetry(
  data: OrderConfirmationData,
  orderId: string,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendOrderConfirmation(data, orderId)
      if (result.success) return result

      // Si échec, attendre avant de réessayer
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    } catch (error) {
      if (attempt === maxRetries) throw error
    }
  }
}
```

### 4. Ajouter une route admin pour renvoyer les emails

**Route** : `app/api/admin/orders/[id]/resend-email/route.ts`

Permet à l'admin de renvoyer manuellement l'email de confirmation si nécessaire.

---

## 🎯 Actions immédiates

### ✅ Déjà fait
1. ✅ Amélioration du logging dans `lib/emails.ts`
2. ✅ Amélioration du logging dans `app/api/orders/route.ts`
3. ✅ Création du script de test `scripts/test-email.ts`

### 🔜 À faire maintenant

1. **Tester l'envoi vers Skynet** :
   ```bash
   npx tsx scripts/test-email.ts votre-email@skynet.be
   ```

2. **Vérifier les logs serveur** :
   - Redémarrer le serveur Next.js
   - Créer une nouvelle commande test
   - Observer les logs dans la console

3. **Vérifier le dashboard Resend** :
   - Connexion sur https://resend.com/emails
   - Chercher les emails des derniers jours
   - Vérifier le statut de la commande 00006

4. **Vérifier la configuration DNS** :
   - Aller sur Resend → Settings → Domains
   - Vérifier scouts-ecaussinnes.be
   - S'assurer que SPF, DKIM, DMARC sont validés

5. **Vérifier les quotas Resend** :
   - Aller sur Resend → Usage
   - Vérifier que vous n'avez pas atteint la limite

### 🔮 À faire prochainement

1. Créer la table `email_logs` dans Supabase
2. Implémenter le tracking des envois
3. Ajouter le webhook Resend
4. Créer la route admin pour renvoyer les emails
5. Ajouter un mécanisme de retry automatique

---

## 📚 Documentation Resend

- Dashboard : https://resend.com/emails
- Documentation API : https://resend.com/docs
- Status des emails : https://resend.com/docs/dashboard/emails/email-status
- Webhooks : https://resend.com/docs/dashboard/webhooks/introduction
- Limites et quotas : https://resend.com/docs/dashboard/usage

---

## 🆘 Support

Si le problème persiste après ces vérifications :

1. **Contacter le support Resend** :
   - Email : support@resend.com
   - Inclure l'ID de l'email (maintenant loggé)
   - Inclure le code de commande (00006)

2. **Vérifier avec le client** :
   - Demander de vérifier les spams
   - Vérifier qu'il n'y a pas de règle de filtrage sur sa boîte
   - Essayer avec une autre adresse email

3. **Alternative temporaire** :
   - Envoyer manuellement l'email via Resend dashboard
   - Utiliser un autre service (SendGrid, Mailgun) en backup

---

## 📝 Notes

Date de diagnostic : 2025-12-04
Commande concernée : 00006
Type de paiement : BANK_TRANSFER
Email destinataire : @skynet.be
Statut Resend : Aucune trace (à vérifier avec les nouveaux logs)
