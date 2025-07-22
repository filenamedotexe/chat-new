'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMessageCircle, IconX } from '@tabler/icons-react';
import { Button, Card } from '@chat/ui';
import { Chat } from './Chat';

interface ChatInterfaceProps {
  floating?: boolean;
}

export function ChatInterface({ floating = false }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(!floating);

  if (floating) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-20 right-4 z-50 w-96 shadow-xl"
            >
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Chat Assistant</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-[500px]">
                  <Chat />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <IconX className="h-6 w-6" />
            ) : (
              <IconMessageCircle className="h-6 w-6" />
            )}
          </motion.div>
        </motion.button>
      </>
    );
  }

  return <Chat />;
}