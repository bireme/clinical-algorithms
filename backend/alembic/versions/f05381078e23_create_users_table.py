"""create users table

Revision ID: f05381078e23
Revises: 84c572bc7d4d
Create Date: 2024-01-02 10:51:03.948132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f05381078e23'
down_revision: Union[str, None] = '84c572bc7d4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('password', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(255)),
        sa.Column('maintainer', sa.Boolean),
        sa.Column('master', sa.Boolean),
        sa.Column('updated_at', sa.DATE(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('users')
