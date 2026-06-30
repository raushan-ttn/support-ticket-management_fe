'use client';

import { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateTicketMutation, type TicketPriority } from '@/services/ticketApi';

const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTicketForm() {
  const [create, { isLoading }] = useCreateTicketMutation();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', priority: 'medium' },
  });

  async function onSubmit(values: FormValues) {
    const files = Array.from(fileRef.current?.files ?? []);
    await create({ ...values, attachments: files });
    reset();
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3, bgcolor: 'background.paper' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        New Ticket
      </Typography>

      <Stack spacing={2}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              size="small"
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              size="small"
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl size="small" fullWidth error={!!errors.priority}>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select {...field} labelId="priority-label" label="Priority">
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
              {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Attachments (optional)
          </Typography>
          <input ref={fileRef} type="file" multiple style={{ fontSize: 14 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isLoading} size="small">
            {isLoading ? 'Creating…' : 'Create Ticket'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
