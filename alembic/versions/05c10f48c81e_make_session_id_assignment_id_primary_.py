"""Make (session_id, assignment_id) primary key on active_assignments

Revision ID: 05c10f48c81e
Revises: 0545257f388e
Create Date: 2025-07-15 23:35:15.262387

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05c10f48c81e'
down_revision: Union[str, None] = '0545257f388e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Drop foreign key from student_submissions referencing session_id
    op.drop_constraint(
        'student_submissions_session_id_fkey',
        'student_submissions',
        type_='foreignkey'
    )

    # Drop old primary key on session_id
    op.drop_constraint(
        'active_assignments_pkey',
        'active_assignments',
        type_='primary'
    )

    # Create new composite primary key on (session_id, assignment_id)
    op.create_primary_key(
        'active_assignments_pkey',
        'active_assignments',
        ['session_id', 'assignment_id']
    )

    # Re-create foreign key from student_submissions to active_assignments(session_id)
    op.create_foreign_key(
        'student_submissions_session_id_fkey',
        'student_submissions', 'active_assignments',
        ['session_id', 'assignment_id'], ['session_id', 'assignment_id'],
        ondelete='CASCADE'
    )


def downgrade():
    op.drop_constraint(
        'student_submissions_session_id_fkey',
        'student_submissions',
        type_='foreignkey'
    )

    op.drop_constraint(
        'active_assignments_pkey',
        'active_assignments',
        type_='primary'
    )

    op.create_primary_key(
        'active_assignments_pkey',
        'active_assignments',
        ['session_id']
    )

    op.create_foreign_key(
        'student_submissions_session_id_fkey',
        'student_submissions', 'active_assignments',
        ['session_id'], ['session_id'],
        ondelete='CASCADE'
    )
