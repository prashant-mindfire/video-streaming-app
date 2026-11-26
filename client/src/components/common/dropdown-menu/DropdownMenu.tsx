import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

export const DropdownMenuRoot = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuSubTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className = '', children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={`
      flex cursor-pointer items-center justify-between gap-2
      rounded-md px-3 py-2 text-sm text-gray-700
      outline-none
      data-highlighted:bg-gray-100
      data-[state=open]:bg-gray-100
      ${className}
    `}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
));

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

export const DropdownMenuSubContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className = '', sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    sideOffset={sideOffset}
    className={`
      z-70 min-w-36 overflow-hidden rounded-lg
      border border-gray-200 bg-white p-1 shadow-lg
      ${className}
    `}
    {...props}
  />
));

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

export const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className = '', sideOffset = 6, align = 'end', ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={`
          z-70 min-w-40 overflow-hidden rounded-lg
          border border-gray-200 bg-white p-1 shadow-lg
          data-[state=open]:animate-in
          data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0
          data-[state=open]:fade-in-0
          ${className}
        `}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuLabel = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={`
      px-3 py-2 text-xs font-semibold text-gray-600
      ${className}
    `}
    {...props}
  />
));

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={`
      flex cursor-pointer items-center gap-2
      rounded-md px-3 py-2 text-sm text-gray-700
      outline-none
      data-highlighted:bg-gray-100
      data-disabled:pointer-events-none
      data-disabled:opacity-50
      ${className}
    `}
    {...props}
  />
));

DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuRadioItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={`
      flex cursor-pointer items-center justify-between gap-3
      rounded-md px-3 py-2 text-sm text-gray-700
      outline-none
      data-highlighted:bg-gray-100
      data-[state=checked]:font-semibold
      data-[state=checked]:text-blue-700
      ${className}
    `}
    {...props}
  />
));

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

export const DropdownMenuItemIndicator = DropdownMenuPrimitive.ItemIndicator;

export const DropdownMenuSeparator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={`my-1 h-px bg-gray-200 ${className}`}
    {...props}
  />
));

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
