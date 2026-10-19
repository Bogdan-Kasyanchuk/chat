import { ActionIcon, CloseButton, Text, Textarea } from '@mantine/core';
import { IconArrowBackUp, IconPencil, IconSend } from '@tabler/icons-react';
import { type FC, type KeyboardEvent, useEffect, useRef, useState } from 'react';

import type { MessageView } from '@/types/chat';
import { MAX_MESSAGE_LENGTH } from '@convex/chatRules';

import classes from './Composer.module.css';

export type ReplyDraft = {
    authorName: string,
    body: string
};

type ComposerProps = {
    disabled: boolean,
    replyTo: ReplyDraft | null,
    editing: Pick<MessageView, 'id' | 'body'> | null,
    onCancel: () => void,
    // Відхилений проміс повертає текст у поле
    onSubmit: (body: string) => Promise<void>
};

const Composer: FC<ComposerProps> = ({ disabled, replyTo, editing, onCancel, onSubmit }) => {
    const [ value, setValue ] = useState(editing?.body ?? '');
    const [ editingId, setEditingId ] = useState(editing?.id ?? null);
    const fieldRef = useRef<HTMLTextAreaElement>(null);

    // Нове редагування підставляє текст повідомлення, скасоване — очищає поле
    if ((editing?.id ?? null) !== editingId) {
        setEditingId(editing?.id ?? null);
        setValue(editing?.body ?? '');
    }

    useEffect(() => {
        if (replyTo || editing) {
            fieldRef.current?.focus();
        }
    }, [ replyTo, editing ]);

    if (disabled) {
        return (
            <div className={ classes.composer }>
                <Text
                    className={ classes.notice }
                    c="dimmed"
                    size="sm"
                >
                    You can&apos;t message a deleted account
                </Text>
            </div>
        );
    }

    const submit = async () => {
        const body = value;

        if (!body.trim()) {
            return;
        }

        setValue('');

        try {
            await onSubmit(body);
        } catch {
            // Помилку вже показано; текст повертаємо, якщо людина не встигла почати нове
            setValue(current => current === '' ? body : current);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void submit();
        }
    };

    const bar = editing
        ? { icon: <IconPencil size={ 18 } />, title: 'Edit message', text: editing.body, close: 'Cancel editing' }
        : replyTo && { icon: <IconArrowBackUp size={ 18 } />, title: `Reply to ${ replyTo.authorName }`, text: replyTo.body, close: 'Cancel reply' };

    return (
        <div className={ classes.composer }>
            { bar && (
                <div className={ classes.bar }>
                    { bar.icon }
                    <div className={ classes.barText }>
                        <Text
                            size="sm"
                            fw={ 600 }
                            truncate
                        >
                            { bar.title }
                        </Text>
                        <Text
                            size="sm"
                            c="dimmed"
                            truncate
                        >
                            { bar.text }
                        </Text>
                    </div>
                    <CloseButton
                        aria-label={ bar.close }
                        onClick={ onCancel }
                    />
                </div>
            ) }
            <div className={ classes.input }>
                <Textarea
                    ref={ fieldRef }
                    className={ classes.field }
                    aria-label="Message"
                    placeholder="Write a message..."
                    value={ value }
                    maxLength={ MAX_MESSAGE_LENGTH }
                    maxRows={ 6 }
                    minRows={ 1 }
                    autosize
                    onChange={ event => {
                        setValue(event.currentTarget.value);
                    } }
                    onKeyDown={ onKeyDown }
                />
                <ActionIcon
                    aria-label="Send"
                    size="lg"
                    onClick={ () => {
                        void submit();
                    } }
                >
                    <IconSend size={ 18 } />
                </ActionIcon>
            </div>
        </div>
    );
};

export default Composer;
