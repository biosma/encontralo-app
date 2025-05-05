import { isSuperAdmin } from '@/lib/access';
import { Tenant } from '@/payload-types';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) {
        return true;
      }
      const tenant = req.user?.tenants?.[0]?.tenant as Tenant;
      return Boolean(tenant?.stripeDetailsSubmitted);
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: 'name',
    description: 'You must verify your account before creating products',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Precio en dolares',
      },
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', hasMany: false },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'refundPolicy',
      type: 'select',
      options: ['30_day', '14_day', '7_day', '3_day', '1_day', 'no_refunds'],
      defaultValue: '30_day',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      // {
      //   features: ({ defaultFeatures }) => [
      //     ...defaultFeatures,
      //     UploadFeature({
      //       collections: {
      //         media: {
      //           fields: [{ name: 'name', type: 'text' }],
      //         },
      //       },
      //     }),
      //   ],
      // }

      admin: {
        description:
          'Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materias. Supports markdown format.',
      },
    },
    {
      name: 'isArchived',
      label: 'Archive',
      defaultValue: false,
      type: 'checkbox',
      admin: {
        description: 'Archived products are not visible in your tenant',
      },
    },
    {
      name: 'isPrivate',
      label: 'Private',
      defaultValue: false,
      type: 'checkbox',
      admin: {
        description: 'If checked products are not visible in the marketplace at all',
      },
    },
  ],
};
