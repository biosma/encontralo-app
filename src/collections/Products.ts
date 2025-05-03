import { isSuperAdmin } from '@/lib/access';
import { Tenant } from '@/payload-types';
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
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
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
      type: 'textarea',
      admin: {
        description:
          'Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materias. Supports markdown format.',
      },
    },
  ],
};
