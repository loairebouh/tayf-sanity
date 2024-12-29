import { SchemaTypeDefinition, Rule } from 'sanity';

const Pricing: SchemaTypeDefinition = {
  name: 'pricing',
  title: 'Pricing',
  type: 'object',
  fields: [
    {
      name: 'dzd',
      title: 'Dinar Algerien',
      type: 'number',
      validation: (Rule: Rule) =>
        Rule.required().min(0).error('Price in DZD is required and must be positive.'),
    },
    {
      name: 'hasDiscount',
      title: 'Has Discount?',
      type: 'boolean',
    },
    {
      name: 'discount',
      title: 'Discount',
      type: 'object',
      fields: [
        {
          name: 'discountValue',
          title: 'Discount Value %',
          type: 'number',
          description: 'Example: 15%',
          validation: (Rule: Rule) =>
            Rule.custom((discountValue, context) => {
              if (context.parent?.hasDiscount && (discountValue === undefined || discountValue < 0)) {
                return 'Discount value must be positive.';
              }
              return true;
            }),
        },
        {
          name: 'newPrice',
          title: 'New Price',
          type: 'number',
          validation: (Rule: Rule) =>
            Rule.custom((dzd, context) => {
              if (context.parent?.hasDiscount && (dzd === undefined || dzd < 0)) {
                return 'Discounted price in DZD is required.';
              }
              return true;
            }),
        },
      ],
      hidden: ({ parent }) => !parent?.hasDiscount,
    },
  ],
};

const Product: SchemaTypeDefinition = {
  name: 'product',
  title: 'All Products',
  type: 'document',
  fields: [
    {
      name: 'productName',
      title: 'Product Name',
      type: 'object',
      validation: (Rule: Rule) => Rule.required().error('Product names are required'),
      fields: [
        {
          name: 'en',
          title: 'English Name',
          type: 'string',
          validation: (Rule: Rule) => Rule.required().error('English product name is required.'),
        },
        {
          name: 'ar',
          title: 'Arabic Name',
          type: 'string',
          validation: (Rule: Rule) => Rule.required().error('Arabic product name is required.'),
        },
      ],
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'productName.en',
        maxLength: 50,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (Rule: Rule) => Rule.required().error('Slug is required.'),
    },
    {
      name: 'hasVolume',
      title: 'Has Volume?',
      type: 'boolean',
      validation: (Rule: Rule) =>
        Rule.required().error('Does the product have multiple offered volumes?'),
      description: 'Specify if this product has multiple volumes with different prices',
    },
    {
      name: 'volumesAndPricesAndDiscounts',
      title: 'Volumes and Prices and Discounts',
      type: 'array',
      of: [
        {
          name: 'volume',
          type: 'object',
          fields: [
            {
              name: 'volume',
              title: 'Volume',
              type: 'number',
              validation: (Rule: Rule) =>
                Rule.required().min(0).error('Volume must be a positive number.'),
            },
            {
              name: 'pricing',
              title: 'Pricing',
              type: 'pricing',
              validation: (Rule: Rule) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule: Rule) =>
        Rule.custom((volumes, context) => {
          const { hasVolume } = context.parent || {};
          if (hasVolume && (!volumes || volumes.length === 0)) {
            return 'At least one volume is required when "Has Volume?" is enabled.';
          }
          return true;
        }),
      hidden: ({ parent }) => !parent?.hasVolume,
    },
    {
      name: 'basicPriceAndDiscount',
      title: 'Basic Price & Discount',
      type: 'pricing', // Reuse `Pricing` type
      validation: (Rule: Rule) =>
        Rule.custom((basicPriceAndDiscount, context) => {
          const { hasVolume } = context.parent || {};
          if (!hasVolume && !basicPriceAndDiscount) {
            return 'Basic price and discount are required when there are no volumes.';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.hasVolume,
    },
    {
      name: 'productPicture',
      title: 'Main Image',
      type: 'image',
      validation: (Rule: Rule) => Rule.required().error('Main product image is required.'),
    },
    {
      name: 'otherImages',
      title: 'Other Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
            crop: true,
          },
        },
      ],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English Description',
          type: 'string',
          validation: (Rule: Rule) => Rule.required().error('English description is required.'),
        },
        {
          name: 'ar',
          title: 'Arabic Description',
          type: 'string',
          validation: (Rule: Rule) => Rule.required().error('Arabic description is required.'),
        },
      ],
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
      validation: (Rule: Rule) =>
        Rule.required().min(1).error('At least one category is required.'),
    }
    ,
  ],
  preview: {
    select: {
      title: 'productName.en',
      media: 'productPicture',
    },
  },
};

export default Product;
export { Pricing };
