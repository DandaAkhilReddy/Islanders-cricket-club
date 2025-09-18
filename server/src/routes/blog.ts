import { Router } from 'express';
import { z } from 'zod';
import { BlogModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  author: z.string().default('Admin'),
  published: z.boolean().default(false)
});

router.get('/', (req, res) => {
  try {
    const published = req.query.published !== 'false';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = BlogModel.getAll(published, limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = BlogModel.getById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
});

router.get('/slug/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const post = BlogModel.getBySlug(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get blog post by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('blogImage'), (req: AuthRequest, res) => {
  try {
    let blogData = blogSchema.parse(req.body);

    if (req.file) {
      blogData = {
        ...blogData,
        cover_image_url: `/uploads/blog/${req.file.filename}`
      } as any;
    }

    const existingPost = BlogModel.getBySlug(blogData.slug);
    if (existingPost) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    const post = BlogModel.create(blogData as any);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog post'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, uploadSingle('blogImage'), (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    let updateData = req.body;

    if (req.file) {
      updateData.cover_image_url = `/uploads/blog/${req.file.filename}`;
    }

    if (updateData.slug) {
      const existingPost = BlogModel.getBySlug(updateData.slug);
      if (existingPost && existingPost.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Slug already exists'
        });
      }
    }

    const post = BlogModel.update(id, updateData);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog post'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = BlogModel.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog post'
    });
  }
});

export default router;