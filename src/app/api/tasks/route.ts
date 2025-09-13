import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { handleOptions } from '@/lib/securityMiddleware';
import { validateNotes, validateDate, sanitizeString } from '@/lib/validation';
import { ApiService } from '@/lib/apiService';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Only kraamhulp can view all tasks, ouders can only view their own
      const tasks = await ApiService.getTasks();
      
      if (req.user?.rol === 'ouders') {
        // Filter tasks to only show tasks assigned to this user or general tasks
        const filteredTasks = tasks.filter(task => 
          task.assignedTo === 'parents' || task.assignedTo === req.user?.rol
        );
        return NextResponse.json(filteredTasks);
      }
      
      return NextResponse.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const rawData = await req.json();
      
      // Validate and sanitize task data
      const errors: string[] = [];
      const sanitizedData: Record<string, unknown> = {};
      
      // Validate title
      if (!rawData.title || typeof rawData.title !== 'string') {
        errors.push('Titel is verplicht');
      } else {
        const title = sanitizeString(rawData.title);
        if (title.length < 3 || title.length > 200) {
          errors.push('Titel moet tussen 3 en 200 karakters zijn');
        } else {
          sanitizedData.title = title;
        }
      }
      
      // Validate description if provided
      if (rawData.description) {
        const descValidation = validateNotes(rawData.description);
        if (!descValidation.isValid) {
          errors.push(...descValidation.errors);
        } else {
          sanitizedData.description = descValidation.sanitizedValue;
        }
      }
      
      // Validate due date if provided
      if (rawData.dueDate) {
        const dateValidation = validateDate(rawData.dueDate, 'Vervaldatum');
        if (!dateValidation.isValid) {
          errors.push(...dateValidation.errors);
        } else {
          sanitizedData.dueDate = dateValidation.sanitizedValue;
        }
      }
      
      // Validate priority
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (rawData.priority && !validPriorities.includes(rawData.priority)) {
        errors.push('Ongeldige prioriteit');
      } else {
        sanitizedData.priority = rawData.priority || 'medium';
      }
      
      // Validate category
      const validCategories = ['baby_care', 'mother_care', 'household', 'medical', 'other'];
      if (rawData.category && !validCategories.includes(rawData.category)) {
        errors.push('Ongeldige categorie');
      } else {
        sanitizedData.category = rawData.category || 'other';
      }
      
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }
      
      // Add metadata
      sanitizedData.createdBy = req.user?.rol === 'kraamhulp' ? 'kraamhulp' : 'parents';
      sanitizedData.assignedTo = rawData.assignedTo || 'parents';
      sanitizedData.status = 'pending';
      sanitizedData.createdAt = new Date().toISOString();
      
      const task = await ApiService.addTask(sanitizedData as unknown as Omit<import('@/types').Task, 'id' | 'createdAt'>);
      return NextResponse.json(task, { status: 201 });
    } catch (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }
  });
}