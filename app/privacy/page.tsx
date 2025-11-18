import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <Link href="/" className="text-scout-600 hover:text-scout-700 font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Politique de confidentialité et RGPD
          </h1>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Collecte des données
            </h2>
            <p className="text-gray-600 mb-4">
              Dans le cadre de notre vente caritative de crémant, nous collectons les
              informations personnelles suivantes :
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse de livraison (si applicable)</li>
              <li>Détails de la commande</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Utilisation des données
            </h2>
            <p className="text-gray-600 mb-4">
              Vos données personnelles sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Traiter et gérer votre commande</li>
              <li>Vous contacter concernant votre commande</li>
              <li>Organiser la livraison ou le retrait de votre commande</li>
              <li>Vous envoyer une confirmation par email</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Conservation des données
            </h2>
            <p className="text-gray-600 mb-4">
              Vos données sont conservées uniquement pendant la durée nécessaire à la
              réalisation de la vente caritative et à la gestion comptable (maximum 2 ans).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Partage des données
            </h2>
            <p className="text-gray-600 mb-4">
              Vos données personnelles ne sont <strong>jamais</strong> vendues, louées ou
              partagées avec des tiers à des fins commerciales. Elles sont uniquement
              accessibles par les responsables scouts de l'unité des Pionniers d'Ecaussinnes
              dans le cadre de la gestion de cette vente caritative.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Vos droits (RGPD)
            </h2>
            <p className="text-gray-600 mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous
              disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>Droit d'accès</strong> : vous pouvez demander une copie de vos
                données personnelles
              </li>
              <li>
                <strong>Droit de rectification</strong> : vous pouvez demander la correction
                de données inexactes
              </li>
              <li>
                <strong>Droit à l'effacement</strong> : vous pouvez demander la suppression
                de vos données
              </li>
              <li>
                <strong>Droit d'opposition</strong> : vous pouvez vous opposer au traitement
                de vos données
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : vous pouvez demander vos données
                dans un format structuré
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Exercer vos droits
            </h2>
            <p className="text-gray-600 mb-4">
              Pour exercer l'un de ces droits, contactez-nous par email à l'adresse :
            </p>
            <p className="text-scout-600 font-medium mb-4">
              <a
                href="mailto:contact@pionniers-ecaussinnes.be"
                className="hover:underline"
              >
                contact@pionniers-ecaussinnes.be
              </a>
            </p>
            <p className="text-gray-600 mb-4">
              Nous nous engageons à répondre à votre demande dans un délai maximum d'un mois.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Sécurité
            </h2>
            <p className="text-gray-600 mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données personnelles contre tout accès non autorisé, perte,
              destruction ou divulgation.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Cookies
            </h2>
            <p className="text-gray-600 mb-4">
              Ce site utilise uniquement des cookies essentiels au fonctionnement de
              l'administration (session admin). Aucun cookie de suivi ou publicitaire n'est
              utilisé.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant cette politique de confidentialité ou le
              traitement de vos données :
            </p>
            <div className="bg-scout-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                Pionniers d'Ecaussinnes
              </p>
              <p className="text-gray-600">
                Email:{' '}
                <a
                  href="mailto:contact@pionniers-ecaussinnes.be"
                  className="text-scout-600 hover:underline"
                >
                  contact@pionniers-ecaussinnes.be
                </a>
              </p>
              <p className="text-gray-600">
                Adresse : Rue des fontenelles 26, 7190 Ecaussinnes
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-BE')}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/commander">
              <Button>Retour à la commande</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
